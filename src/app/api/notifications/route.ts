import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import type { Notification } from "@/types/database";

const DEFAULT_LIMIT = 20;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unread_only = searchParams.get("unread_only") === "true";
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
      50
    );

    const admin = createAdminClient();
    const { count: unreadCount } = await admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    let query = admin
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (unread_only) {
      query = query.eq("is_read", false);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error("Notifications fetch error:", error);
      return NextResponse.json(
        { error: "通知の取得に失敗しました。" },
        { status: 500 }
      );
    }

    const notifications = (rows ?? []) as Notification[];
    return NextResponse.json({
      notifications,
      unread_count: unreadCount ?? 0,
    });
  } catch (err) {
    console.error("Notifications GET error:", err);
    return NextResponse.json(
      { error: "通知の取得に失敗しました。" },
      { status: 500 }
    );
  }
}
