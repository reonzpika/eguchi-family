-- Learning journey: per-member lesson progress.
-- Static lesson content lives in code (src/lib/curriculum/lessons.ts);
-- this table only records who completed which lesson + a one-line reflection.

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'done',
  reflection TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Mirrors the app's convention: real access is via the service-role admin client;
-- these policies keep direct anon/authenticated access scoped to the owner.
DROP POLICY IF EXISTS "Users can view own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can view own lesson progress" ON public.lesson_progress
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can upsert own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can upsert own lesson progress" ON public.lesson_progress
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can update own lesson progress" ON public.lesson_progress
  FOR UPDATE USING (auth.uid()::text = user_id);
