import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendNotification } from "@/lib/notifications";

/**
 * Friday 7pm weekly reflection reminder.
 * Call from Vercel Cron (vercel.json: "0 19 * * 5") or external cron.
 * Secured by CRON_SECRET in production.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data: projects } = await admin
      .from("projects")
      .select("user_id, shared_with_all");

    const userIds = [...new Set(
      (projects ?? [])
        .filter((p) => !p.shared_with_all)
        .map((p) => p.user_id)
    )];

    let created = 0;
    for (const userId of userIds) {
      const result = await sendNotification({
        user_id: userId,
        type: "weekly_reflection",
        title: "今週の振り返りの時間です",
        body: "プロジェクトの進捗を振り返って、AIのアドバイスを受け取りましょう。",
        action_url: "/projects",
        priority: "medium",
      });
      if (result) created++;
    }

    return NextResponse.json({ ok: true, notifications_created: created, users: userIds.length });
  } catch (err) {
    console.error("Friday reminder error:", err);
    return NextResponse.json(
      { error: "Reminder failed." },
      { status: 500 }
    );
  }
}
