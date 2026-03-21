-- Family AI Hub: tools, missions, threads, posts (user_id TEXT = NextAuth users.id UUID string).
-- API uses service role; RLS enabled with permissive read for published content patterns.

-- Tool catalogue
CREATE TABLE IF NOT EXISTS public.family_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  profile_json JSONB NOT NULL DEFAULT '{}',
  mission_draft_json JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  featured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_tools_status ON public.family_tools(status);
CREATE INDEX IF NOT EXISTS idx_family_tools_created ON public.family_tools(created_at DESC);

-- Missions (admin-authored in v1)
CREATE TABLE IF NOT EXISTS public.family_tool_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES public.family_tools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  estimated_minutes INTEGER,
  steps JSONB NOT NULL DEFAULT '[]',
  prompt_blocks JSONB NOT NULL DEFAULT '[]',
  done_criteria JSONB NOT NULL DEFAULT '[]',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_tool_missions_tool ON public.family_tool_missions(tool_id, sort_order);

-- Threads: tool-scoped (Q&A) or plaza (tool_id NULL, kind general)
CREATE TABLE IF NOT EXISTS public.family_tool_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES public.family_tools(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('qa', 'general')),
  title TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (tool_id IS NULL AND kind = 'general')
    OR (tool_id IS NOT NULL AND kind IN ('qa', 'general'))
  )
);

CREATE INDEX IF NOT EXISTS idx_family_tool_threads_tool ON public.family_tool_threads(tool_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_tool_threads_plaza ON public.family_tool_threads(updated_at DESC) WHERE tool_id IS NULL;

-- Posts in threads
CREATE TABLE IF NOT EXISTS public.family_tool_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.family_tool_threads(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.family_tool_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_tool_posts_thread ON public.family_tool_posts(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_family_tool_posts_parent ON public.family_tool_posts(parent_id);

ALTER TABLE public.family_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_tool_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_tool_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_tool_posts ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; optional policies for future direct client access
CREATE POLICY "service_role_family_tools"
  ON public.family_tools FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role_family_tool_missions"
  ON public.family_tool_missions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role_family_tool_threads"
  ON public.family_tool_threads FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role_family_tool_posts"
  ON public.family_tool_posts FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
