import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body as { content?: string };

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: comment, error: fetchError } = await admin
      .from("comments")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: "コメントが見つかりませんでした。" },
        { status: 404 }
      );
    }

    if (comment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "このコメントを編集する権限がありません。" },
        { status: 403 }
      );
    }

    const created = new Date(comment.created_at).getTime();
    if (Date.now() - created > EDIT_WINDOW_MS) {
      return NextResponse.json(
        { error: "編集は24時間以内のみ可能です。" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await admin
      .from("comments")
      .update({
        content: content.trim(),
        is_edited: true,
        edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Comment update error:", updateError);
      return NextResponse.json(
        { error: "コメントの更新に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: updated });
  } catch (err) {
    console.error("Comment PATCH error:", err);
    return NextResponse.json(
      { error: "コメントの更新に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();
    const { data: comment, error: fetchError } = await admin
      .from("comments")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: "コメントが見つかりませんでした。" },
        { status: 404 }
      );
    }

    if (comment.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "このコメントを削除する権限がありません。" },
        { status: 403 }
      );
    }

    const { data: updated, error: updateError } = await admin
      .from("comments")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        content: "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Comment delete error:", updateError);
      return NextResponse.json(
        { error: "コメントの削除に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: updated });
  } catch (err) {
    console.error("Comment DELETE error:", err);
    return NextResponse.json(
      { error: "コメントの削除に失敗しました。" },
      { status: 500 }
    );
  }
}
