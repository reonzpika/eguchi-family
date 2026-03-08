import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/lib/notifications";
import { authOptions } from "@/lib/auth";
import type { NotificationType, NotificationPriority } from "@/types/database";

/**
 * Internal endpoint to create a notification (e.g. from milestone complete, comment).
 * Caller must be authenticated (same app).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      user_id,
      type,
      title,
      body: bodyText,
      action_url,
      project_id,
      comment_id,
      priority,
      send_push,
    } = body as {
      user_id: string;
      type: NotificationType;
      title: string;
      body: string;
      action_url?: string;
      project_id?: string;
      comment_id?: string;
      priority?: NotificationPriority;
      send_push?: boolean;
    };

    if (!user_id || !type || !title || !bodyText) {
      return NextResponse.json(
        { error: "user_id, type, title, body are required" },
        { status: 400 }
      );
    }

    const result = await sendNotification({
      user_id,
      type,
      title,
      body: bodyText,
      action_url,
      project_id,
      comment_id,
      priority,
      send_push,
    });

    if (!result) {
      return NextResponse.json(
        { error: "通知の作成に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notification: { id: result.id },
      push_sent: false,
    });
  } catch (err) {
    console.error("Notifications send error:", err);
    return NextResponse.json(
      { error: "通知の送信に失敗しました。" },
      { status: 500 }
    );
  }
}
