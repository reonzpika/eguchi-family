import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import type { ActivityFeed, ActivityType } from "@/types/database";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10)),
      MAX_LIMIT
    );
    const before = searchParams.get("before") ?? undefined;

    const admin = createAdminClient();
    let query = admin
      .from("activity_feed")
      .select("id, user_id, activity_type, idea_id, project_id, milestone_id, title, emoji, metadata, is_private, created_at")
      .eq("is_private", false)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (before) {
      query = query.lt("created_at", before);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error("Activity feed fetch error:", error);
      return NextResponse.json(
        { error: "アクティビティの取得に失敗しました。" },
        { status: 500 }
      );
    }

    const activities = (rows ?? []) as ActivityFeed[];
    const hasMore = activities.length > limit;
    const list = hasMore ? activities.slice(0, limit) : activities;

    const userIds = [...new Set(list.map((a) => a.user_id))];
    const projectIds = [...new Set(list.map((a) => a.project_id).filter(Boolean))] as string[];

    const { data: usersData } = await admin
      .from("users")
      .select("id, name")
      .in("id", userIds);

    const userMap = new Map(
      (usersData ?? []).map((u: { id: string; name: string | null }) => [u.id, { id: u.id, name: u.name ?? "不明" }])
    );

    let sharedProjectIds = new Set<string>();
    if (projectIds.length > 0) {
      const { data: sharedProjects } = await admin
        .from("projects")
        .select("id")
        .in("id", projectIds)
        .eq("shared_with_all", true);
      sharedProjectIds = new Set((sharedProjects ?? []).map((p: { id: string }) => p.id));
    }

    const activitiesWithUser = list.map((a) => {
      const displayName =
        a.project_id && sharedProjectIds.has(a.project_id)
          ? "家族"
          : (userMap.get(a.user_id)?.name ?? "不明");
      return {
        ...a,
        user: { id: a.user_id, name: displayName },
      };
    });

    return NextResponse.json({
      activities: activitiesWithUser,
      has_more: hasMore,
    });
  } catch (err) {
    console.error("Activity feed GET error:", err);
    return NextResponse.json(
      { error: "アクティビティの取得に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      activity_type,
      title,
      emoji,
      project_id,
      milestone_id,
      idea_id,
      is_private = false,
      metadata,
    } = body as {
      activity_type: ActivityType;
      title: string;
      emoji?: string;
      project_id?: string;
      milestone_id?: string;
      idea_id?: string;
      is_private?: boolean;
      metadata?: Record<string, unknown>;
    };

    if (!activity_type || !title || typeof title !== "string") {
      return NextResponse.json(
        { error: "activity_type and title are required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: activity, error } = await admin
      .from("activity_feed")
      .insert({
        user_id: session.user.id,
        activity_type,
        title: title.trim(),
        emoji: emoji ?? null,
        project_id: project_id ?? null,
        milestone_id: milestone_id ?? null,
        idea_id: idea_id ?? null,
        is_private: !!is_private,
        metadata: metadata ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Activity feed insert error:", error);
      return NextResponse.json(
        { error: "アクティビティの記録に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ activity });
  } catch (err) {
    console.error("Activity feed POST error:", err);
    return NextResponse.json(
      { error: "アクティビティの記録に失敗しました。" },
      { status: 500 }
    );
  }
}
