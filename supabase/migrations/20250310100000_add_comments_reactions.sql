-- Comments and reactions (user_id TEXT for NextAuth).

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
  activity_feed_id UUID REFERENCES public.activity_feed(id) ON DELETE CASCADE,
  living_doc_section TEXT,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  thread_depth INTEGER DEFAULT 0,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (thread_depth <= 3),
  CHECK (
    (project_id IS NOT NULL) OR
    (milestone_id IS NOT NULL) OR
    (activity_feed_id IS NOT NULL) OR
    (living_doc_section IS NOT NULL AND project_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_milestone_id ON public.comments(milestone_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_not_deleted ON public.comments(project_id, created_at DESC) WHERE is_deleted = FALSE;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view non-deleted comments"
  ON public.comments FOR SELECT
  USING (is_deleted = FALSE);

CREATE POLICY "Users can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (user_id = auth.uid()::text);

-- Reactions
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, comment_id, emoji),
  CHECK (emoji IN ('👍', '❤️', '🎉', '💡', '🤔'))
);

CREATE INDEX IF NOT EXISTS idx_reactions_comment_id ON public.reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions"
  ON public.reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE
  USING (user_id = auth.uid()::text);
