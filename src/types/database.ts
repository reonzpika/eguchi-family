export type MilestoneStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  sequence_order: number;
  status: MilestoneStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  milestone_id: string;
  title: string;
  description: string | null;
  sequence_order: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MilestoneWithTasks extends Milestone {
  tasks: Task[];
  completion_percentage: number;
}

export interface Reflection {
  id: string;
  user_id: string;
  project_id: string;
  what_worked: string | null;
  wins: string | null;
  blockers: string | null;
  ai_insight: string | null;
  living_doc_updated: boolean;
  new_milestones_generated: boolean;
  week_of: string;
  submitted_at: string;
  created_at: string;
}

export type ActivityType =
  | "idea_started"
  | "project_created"
  | "milestone_completed"
  | "reflection_submitted"
  | "comment_added";

export interface ActivityFeed {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  idea_id: string | null;
  project_id: string | null;
  milestone_id: string | null;
  title: string;
  emoji: string | null;
  metadata: Record<string, unknown> | null;
  is_private: boolean;
  created_at: string;
}

export const REACTION_EMOJIS = ["👍", "❤️", "🎉", "💡", "🤔"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export interface Comment {
  id: string;
  user_id: string;
  project_id: string | null;
  milestone_id: string | null;
  activity_feed_id: string | null;
  living_doc_section: string | null;
  parent_comment_id: string | null;
  thread_depth: number;
  content: string;
  mentions: string[];
  is_deleted: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  user_id: string;
  comment_id: string;
  emoji: string;
  created_at: string;
}

export type NotificationType =
  | "milestone_celebration"
  | "weekly_reflection"
  | "comment_on_project"
  | "comment_mention"
  | "family_milestone"
  | "inactive_nudge";

export type NotificationPriority = "high" | "medium" | "low";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  action_url: string | null;
  project_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  read_at: string | null;
  is_pushed: boolean;
  pushed_at: string | null;
  created_at: string;
}
