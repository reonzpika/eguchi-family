import { createAdminClient } from "@/lib/supabase-admin";
import type { NotificationType, NotificationPriority } from "@/types/database";

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
 * Push is not implemented yet; send_push is ignored.
 */
export async function sendNotification(payload: SendNotificationPayload): Promise<{ id: string } | null> {
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
    return data;
  } catch (err) {
    console.error("sendNotification error:", err);
    return null;
  }
}
