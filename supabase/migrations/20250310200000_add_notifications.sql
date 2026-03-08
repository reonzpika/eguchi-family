-- Notifications (user_id TEXT for NextAuth).

CREATE TYPE notification_type AS ENUM (
  'milestone_celebration',
  'weekly_reflection',
  'comment_on_project',
  'comment_mention',
  'family_milestone',
  'inactive_nudge'
);

CREATE TYPE notification_priority AS ENUM (
  'high',
  'medium',
  'low'
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type notification_type NOT NULL,
  priority notification_priority DEFAULT 'medium',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_pushed BOOLEAN DEFAULT FALSE,
  pushed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);
