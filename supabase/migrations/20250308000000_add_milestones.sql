-- Phase B: Milestones and tasks
-- Requires: projects table and public.users to exist

-- Enum for milestone status
CREATE TYPE milestone_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
);

-- Ensure update_updated_at exists for triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add progress_percentage to projects (if column does not exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'progress_percentage'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN progress_percentage INTEGER DEFAULT 0;
    ALTER TABLE public.projects ADD CONSTRAINT projects_progress_percentage_check
      CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
  END IF;
END $$;

-- Milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  status milestone_status DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, sequence_order)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(milestone_id, sequence_order)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_project_order ON public.milestones(project_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON public.tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_order ON public.tasks(milestone_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_tasks_incomplete ON public.tasks(milestone_id) WHERE is_completed = FALSE;

-- RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view milestones" ON public.milestones;
CREATE POLICY "All users can view milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id)
  );

DROP POLICY IF EXISTS "Users can manage own milestones" ON public.milestones;
CREATE POLICY "Users can manage own milestones" ON public.milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = milestones.project_id
      AND projects.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "All users can view tasks" ON public.tasks;
CREATE POLICY "All users can view tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.milestones
      JOIN public.projects ON projects.id = milestones.project_id
      WHERE milestones.id = tasks.milestone_id
    )
  );

DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks" ON public.tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.milestones
      JOIN public.projects ON projects.id = milestones.project_id
      WHERE milestones.id = tasks.milestone_id
      AND projects.user_id = auth.uid()::text
    )
  );

-- Triggers
DROP TRIGGER IF EXISTS milestones_updated_at ON public.milestones;
CREATE TRIGGER milestones_updated_at BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tasks_updated_at ON public.tasks;
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
