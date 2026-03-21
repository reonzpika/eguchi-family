import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const body = await request.json();
    const text = typeof body.body === "string" ? body.body.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "body required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: post, error } = await admin
      .from("family_tool_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    if (post.user_id !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { data: updated, error: upErr } = await admin
      .from("family_tool_posts")
      .update({
        body: text,
        is_edited: true,
        edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .select("*")
      .single();

    if (upErr || !updated) {
      return NextResponse.json({ error: "update failed" }, { status: 500 });
    }

    return NextResponse.json({ post: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const admin = createAdminClient();
    const { data: post, error } = await admin
      .from("family_tool_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    if (post.user_id !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { error: delErr } = await admin
      .from("family_tool_posts")
      .update({
        deleted_at: new Date().toISOString(),
        body: "（削除されました）",
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (delErr) {
      return NextResponse.json({ error: "delete failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
