-- Phase 3: projects ai_insight, last_activity_at; living_documents updated_by; activity_type ai_insight
-- Note: ALTER TYPE ... ADD VALUE cannot run inside a DO block; keep it standalone.

-- Add ai_insight to activity_type enum (run outside transaction in older PG)
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'ai_insight';

-- Projects: ai_insight, ai_insight_updated_at, last_activity_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'ai_insight'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN ai_insight TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'ai_insight_updated_at'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN ai_insight_updated_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN last_activity_at TIMESTAMPTZ;
  END IF;
END $$;

-- Living documents: updated_by ('ai' or 'user')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'living_documents' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE public.living_documents ADD COLUMN updated_by TEXT;
  END IF;
END $$;
