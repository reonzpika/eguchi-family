import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const admin = createAdminClient();
    const ideasRes = await admin
      .from("ideas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id);
    const projectsRes = await admin
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id);
    return NextResponse.json({
      ideaCount: ideasRes.count ?? 0,
      projectCount: projectsRes.count ?? 0,
    });
  } catch (err) {
    console.error("Stats GET error:", err);
    return NextResponse.json(
      { error: "集計の取得に失敗しました。" },
      { status: 500 }
    );
  }
}
