import { createAdminClient } from "@/lib/supabase-admin";
import type { ActivityType } from "@/types/database";

export interface RecordActivityPayload {
  activity_type: ActivityType;
  title: string;
  emoji?: string;
  project_id?: string;
  milestone_id?: string;
  idea_id?: string;
  is_private?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Insert an activity feed row (internal use from API routes).
 * Uses service role so RLS does not block.
 */
export async function recordActivity(
  userId: string,
  payload: RecordActivityPayload
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("activity_feed").insert({
      user_id: userId,
      activity_type: payload.activity_type,
      title: payload.title,
      emoji: payload.emoji ?? null,
      project_id: payload.project_id ?? null,
      milestone_id: payload.milestone_id ?? null,
      idea_id: payload.idea_id ?? null,
      is_private: !!payload.is_private,
      metadata: payload.metadata ?? null,
    });
  } catch (err) {
    console.error("recordActivity error:", err);
  }
}
