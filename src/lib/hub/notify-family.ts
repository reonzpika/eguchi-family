import { createAdminClient } from "@/lib/supabase-admin";
import { sendNotification } from "@/lib/notifications";

/**
 * Notify all family users (excluding optional actor) for hub-wide announcements.
 */
export async function notifyAllFamilyUsers(params: {
  title: string;
  body: string;
  action_url: string;
  type: "hub_new_tool" | "hub_new_mission";
  exclude_user_id?: string;
  send_push?: boolean;
}): Promise<void> {
  const admin = createAdminClient();
  const { data: users, error } = await admin.from("users").select("id");
  if (error || !users?.length) {
    console.error("notifyAllFamilyUsers", error);
    return;
  }

  for (const u of users) {
    const id = u.id as string;
    if (params.exclude_user_id && id === params.exclude_user_id) continue;
    await sendNotification({
      user_id: id,
      type: params.type,
      title: params.title,
      body: params.body,
      action_url: params.action_url,
      send_push: params.send_push ?? true,
    });
  }
}
