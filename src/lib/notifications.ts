import { createAdminClient } from "@/lib/supabase-admin";
import type { NotificationType, NotificationPriority } from "@/types/database";
import { sendPushNotification } from "@/lib/web-push";

export interface SendNotificationPayload {
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  action_url?: string;
  project_id?: string;
  comment_id?: string;
  priority?: NotificationPriority;
  send_push?: boolean;
}

/**
 * Insert a notification for a user (internal use from API routes).
 * Optionally sends web push when send_push is true and VAPID is configured.
 */
export async function sendNotification(
  payload: SendNotificationPayload
): Promise<{ id: string } | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("notifications")
      .insert({
        user_id: payload.user_id,
        type: payload.type,
        priority: payload.priority ?? "medium",
        title: payload.title,
        body: payload.body,
        action_url: payload.action_url ?? null,
        project_id: payload.project_id ?? null,
        comment_id: payload.comment_id ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("sendNotification error:", error);
      return null;
    }

    if (payload.send_push && data?.id) {
      const { data: subs } = await admin
        .from("push_subscriptions")
        .select("endpoint, p256dh_key, auth_key")
        .eq("user_id", payload.user_id)
        .eq("is_active", true);

      for (const sub of subs ?? []) {
        await sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh_key, auth: sub.auth_key },
          },
          {
            title: payload.title,
            body: payload.body,
            url: payload.action_url ?? "/",
          }
        );
      }
    }

    return data;
  } catch (err) {
    console.error("sendNotification error:", err);
    return null;
  }
}
