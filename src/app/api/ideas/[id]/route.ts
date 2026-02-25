import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerComponentClient();

    // Look up user in Supabase
    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !dbUser) {
      return NextResponse.json(
        { error: "ユーザーが見つかりませんでした。" },
        { status: 404 }
      );
    }

    // Verify the idea belongs to the current user
    const { data: idea, error: ideaError } = await supabase
      .from("ideas")
      .select("user_id")
      .eq("id", id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: "アイデアが見つかりませんでした。" },
        { status: 404 }
      );
    }

    if (idea.user_id !== dbUser.id) {
      return NextResponse.json(
        { error: "このアイデアを編集する権限がありません。" },
        { status: 403 }
      );
    }

    // Update the title and updated_at
    const { error: updateError } = await supabase
      .from("ideas")
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating idea:", updateError);
      return NextResponse.json(
        { error: "アイデアの更新に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/ideas/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
