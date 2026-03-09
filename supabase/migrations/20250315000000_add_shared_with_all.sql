-- Shared project: projects editable by all family members.
-- shared_with_all = true: any authenticated user can edit (API enforces; app uses admin client).
-- RLS kept minimal since API routes use service role.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'shared_with_all'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN shared_with_all BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_shared_with_all ON public.projects(shared_with_all) WHERE shared_with_all = TRUE;
