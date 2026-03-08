import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { REACTION_EMOJIS } from "@/types/database";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; emoji: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: commentId, emoji } = await params;
    const decodedEmoji = decodeURIComponent(emoji);

    if (!REACTION_EMOJIS.includes(decodedEmoji as (typeof REACTION_EMOJIS)[number])) {
      return NextResponse.json(
        { error: "Invalid emoji" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("reactions")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", session.user.id)
      .eq("emoji", decodedEmoji);

    if (error) {
      console.error("Reaction delete error:", error);
      return NextResponse.json(
        { error: "リアクションの削除に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reaction DELETE error:", err);
    return NextResponse.json(
      { error: "リアクションの削除に失敗しました。" },
      { status: 500 }
    );
  }
}
