-- Ideas, projects, and living_documents (required before milestones).
-- Uses user_id TEXT for NextAuth compatibility; no FK to auth.users.

-- Ideas table
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  original_paste TEXT,
  polished_content TEXT,
  ai_suggestions JSONB,
  is_upgraded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON public.ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_is_upgraded ON public.ideas(is_upgraded);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ideas"
  ON public.ideas FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own ideas"
  ON public.ideas FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own ideas"
  ON public.ideas FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  visibility TEXT NOT NULL DEFAULT 'unlisted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_idea_id ON public.projects(idea_id);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Living documents table
CREATE TABLE IF NOT EXISTS public.living_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_living_documents_project_id ON public.living_documents(project_id);

ALTER TABLE public.living_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view living_documents for projects they can see"
  ON public.living_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = living_documents.project_id
    )
  );

CREATE POLICY "Users can insert living_documents for own projects"
  ON public.living_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = living_documents.project_id
      AND projects.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update living_documents for own projects"
  ON public.living_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = living_documents.project_id
      AND projects.user_id = auth.uid()::text
    )
  );
