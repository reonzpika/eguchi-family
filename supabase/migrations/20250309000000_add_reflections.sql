-- Phase C: Reflections
-- Requires: projects table to exist

CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  what_worked TEXT,
  wins TEXT,
  blockers TEXT,
  ai_insight TEXT,
  living_doc_updated BOOLEAN DEFAULT FALSE,
  new_milestones_generated BOOLEAN DEFAULT FALSE,
  week_of DATE NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON public.reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_project_id ON public.reflections(project_id);
CREATE INDEX IF NOT EXISTS idx_reflections_week ON public.reflections(week_of DESC);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reflections" ON public.reflections;
CREATE POLICY "Users can view own reflections" ON public.reflections
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can create own reflections" ON public.reflections;
CREATE POLICY "Users can create own reflections" ON public.reflections
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
