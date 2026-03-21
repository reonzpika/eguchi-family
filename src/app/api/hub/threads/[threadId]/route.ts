import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;
    const admin = createAdminClient();
    const { data: thread, error } = await admin
      .from("family_tool_threads")
      .select("*")
      .eq("id", threadId)
      .single();

    if (error || !thread) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    if (thread.tool_id) {
      const { data: tool } = await admin
        .from("family_tools")
        .select("status")
        .eq("id", thread.tool_id)
        .single();
      if (!tool || tool.status !== "published") {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
    }

    const { data: posts } = await admin
      .from("family_tool_posts")
      .select("*")
      .eq("thread_id", threadId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    const { data: users } = await admin
      .from("users")
      .select("id, name, member_id");

    const nameById = new Map(
      (users ?? []).map((u) => [u.id as string, (u.name as string) ?? ""])
    );

    return NextResponse.json({
      thread,
      posts: posts ?? [],
      userNames: Object.fromEntries(nameById),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
