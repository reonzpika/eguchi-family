import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServerComponentClient } from "@/lib/supabase-server";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/ideas/[id] – fetch a single idea for the current user.
 * Uses admin client so RLS does not block (app uses NextAuth user_id).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: idea, error } = await supabase
      .from("ideas")
      .select("id, title, polished_content, ai_suggestions, user_id, chat_history, chat_summary")
      .eq("id", id)
      .single();

    if (error || !idea) {
      return NextResponse.json(
        { error: "アイデアが見つかりませんでした。" },
        { status: 404 }
      );
    }

    if (idea.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "このアイデアを表示する権限がありません。" },
        { status: 403 }
      );
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error("Error in GET /api/ideas/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
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

    if (idea.user_id !== session.user.id) {
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

/**
 * DELETE /api/ideas/[id] – delete an idea. Caller must own the idea.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createAdminClient();

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

    if (idea.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "このアイデアを削除する権限がありません。" },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from("ideas")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting idea:", deleteError);
      return NextResponse.json(
        { error: "アイデアの削除に失敗しました。" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error in DELETE /api/ideas/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
