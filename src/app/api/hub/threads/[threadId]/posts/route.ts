import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { sendNotification } from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;
    const body = await request.json();
    const text = typeof body.body === "string" ? body.body.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "body required" }, { status: 400 });
    }

    const parentId =
      typeof body.parent_id === "string" && body.parent_id ? body.parent_id : null;

    const admin = createAdminClient();
    const { data: thread, error: tErr } = await admin
      .from("family_tool_threads")
      .select("*")
      .eq("id", threadId)
      .single();

    if (tErr || !thread) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { data: post, error } = await admin
      .from("family_tool_posts")
      .insert({
        thread_id: threadId,
        parent_id: parentId,
        user_id: session.user.id,
        body: text,
      })
      .select("*")
      .single();

    if (error || !post) {
      console.error(error);
      return NextResponse.json({ error: "insert failed" }, { status: 500 });
    }

    await admin
      .from("family_tool_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", threadId);

    const notifyIds = new Set<string>();
    if (thread.created_by !== session.user.id) {
      notifyIds.add(thread.created_by);
    }
    if (parentId) {
      const { data: parent } = await admin
        .from("family_tool_posts")
        .select("user_id")
        .eq("id", parentId)
        .single();
      if (parent?.user_id && parent.user_id !== session.user.id) {
        notifyIds.add(parent.user_id as string);
      }
    }

    const actionUrl = thread.tool_id
      ? `/tools/${thread.tool_id}/threads/${threadId}`
      : `/discussions/${threadId}`;

    for (const uid of notifyIds) {
      await sendNotification({
        user_id: uid,
        type: "hub_thread_reply",
        title: "スレッドに返信がありました",
        body: text.length > 80 ? `${text.slice(0, 80)}…` : text,
        action_url: actionUrl,
        send_push: true,
      });
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
