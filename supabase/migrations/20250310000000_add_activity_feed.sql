-- Activity feed: enum and table (user_id TEXT for NextAuth).
-- RLS: view public or own; insert own (API may use service role).

CREATE TYPE activity_type AS ENUM (
  'idea_started',
  'project_created',
  'milestone_completed',
  'reflection_submitted',
  'comment_added'
);

CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  activity_type activity_type NOT NULL,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  emoji TEXT,
  metadata JSONB,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON public.activity_feed(created_at DESC) WHERE is_private = FALSE;

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view public feed" ON public.activity_feed;
CREATE POLICY "All users can view public feed" ON public.activity_feed
  FOR SELECT USING (
    is_private = FALSE OR user_id = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can create own activities" ON public.activity_feed;
CREATE POLICY "Users can create own activities" ON public.activity_feed
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);
