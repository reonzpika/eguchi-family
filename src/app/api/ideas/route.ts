import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/ideas – list ideas for the current user.
 * Uses admin client so results are not blocked by RLS (app uses NextAuth user_id, not Supabase auth.uid()).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: ideasData, error } = await supabase
      .from("ideas")
      .select("id, title, polished_content, updated_at")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching ideas:", error);
      return NextResponse.json(
        { error: "アイデアの読み込みに失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(ideasData ?? []);
  } catch (error) {
    console.error("Error in GET /api/ideas:", error);
    return NextResponse.json(
      { error: "データの読み込みに失敗しました" },
      { status: 500 }
    );
  }
}
