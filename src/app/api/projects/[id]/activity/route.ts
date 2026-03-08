import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import type { ActivityFeed } from "@/types/database";

export async function GET(
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

    const { id: projectId } = await params;
    if (!projectId) {
      return NextResponse.json(
        { error: "project id is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりませんでした。" },
        { status: 404 }
      );
    }

    const { data: rows, error } = await admin
      .from("activity_feed")
      .select("id, user_id, activity_type, project_id, milestone_id, title, emoji, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Project activity fetch error:", error);
      return NextResponse.json(
        { error: "アクティビティの取得に失敗しました。" },
        { status: 500 }
      );
    }

    const activities = (rows ?? []) as ActivityFeed[];
    const userIds = [...new Set(activities.map((a) => a.user_id))];
    const { data: usersData } = await admin
      .from("users")
      .select("id, name")
      .in("id", userIds);

    const userMap = new Map(
      (usersData ?? []).map((u: { id: string; name: string | null }) => [
        u.id,
        { id: u.id, name: u.name ?? "不明" },
      ])
    );

    const activitiesWithUser = activities.map((a) => ({
      ...a,
      user: userMap.get(a.user_id) ?? { id: a.user_id, name: "不明" },
    }));

    return NextResponse.json({ activities: activitiesWithUser });
  } catch (err) {
    console.error("Error in GET /api/projects/[id]/activity:", err);
    return NextResponse.json(
      { error: "アクティビティの取得に失敗しました。" },
      { status: 500 }
    );
  }
}
