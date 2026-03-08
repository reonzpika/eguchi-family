-- Discovery assessment results stored per user (phase-1-discovery profile).
-- Used to persist assessment answers and mark discovery as completed.

CREATE TABLE IF NOT EXISTS public.discovery_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  answers JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discovery_profiles_user_id ON public.discovery_profiles(user_id);

ALTER TABLE public.discovery_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own discovery profile"
  ON public.discovery_profiles FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own discovery profile"
  ON public.discovery_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own discovery profile"
  ON public.discovery_profiles FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Service role full access to discovery_profiles"
  ON public.discovery_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
