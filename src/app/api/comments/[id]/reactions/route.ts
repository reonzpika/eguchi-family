import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { REACTION_EMOJIS } from "@/types/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: commentId } = await params;
    const body = await request.json();
    const emoji = body?.emoji as string | undefined;

    if (!emoji || !REACTION_EMOJIS.includes(emoji as (typeof REACTION_EMOJIS)[number])) {
      return NextResponse.json(
        { error: "emoji must be one of: " + REACTION_EMOJIS.join(", ") },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: comment } = await admin
      .from("comments")
      .select("id")
      .eq("id", commentId)
      .eq("is_deleted", false)
      .single();

    if (!comment) {
      return NextResponse.json(
        { error: "コメントが見つかりませんでした。" },
        { status: 404 }
      );
    }

    const { data: reaction, error } = await admin
      .from("reactions")
      .insert({
        user_id: session.user.id,
        comment_id: commentId,
        emoji,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        const { data: existing } = await admin
          .from("reactions")
          .select()
          .eq("user_id", session.user.id)
          .eq("comment_id", commentId)
          .eq("emoji", emoji)
          .single();
        return NextResponse.json({ reaction: existing });
      }
      console.error("Reaction insert error:", error);
      return NextResponse.json(
        { error: "リアクションの追加に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reaction });
  } catch (err) {
    console.error("Reaction POST error:", err);
    return NextResponse.json(
      { error: "リアクションの追加に失敗しました。" },
      { status: 500 }
    );
  }
}
