import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { authOptions } from "@/lib/auth";
import { sendPushNotification } from "@/lib/web-push";

/**
 * Internal endpoint to send push notification to a user (e.g. from notifications/send).
 * Caller must be authenticated.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, title, body: bodyText, url } = body as {
      user_id: string;
      title: string;
      body: string;
      url?: string;
    };

    if (!user_id || !title || !bodyText) {
      return NextResponse.json(
        { error: "user_id, title, body are required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh_key, auth_key")
      .eq("user_id", user_id)
      .eq("is_active", true);

    let sent = 0;
    for (const sub of subs ?? []) {
      const ok = await sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh_key, auth: sub.auth_key },
        },
        { title, body: bodyText, url }
      );
      if (ok) sent++;
    }

    return NextResponse.json({ sent, total: subs?.length ?? 0 });
  } catch (err) {
    console.error("Push send error:", err);
    return NextResponse.json(
      { error: "プッシュ送信に失敗しました。" },
      { status: 500 }
    );
  }
}
