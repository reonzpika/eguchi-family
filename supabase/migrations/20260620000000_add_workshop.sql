-- Workshop redesign MVP: a member's businesses and their per-stage summaries.
-- Real work happens in the member's own Claude; this only tracks the idea,
-- which stage they are on, and the structured summaries they paste back.
-- Access is via the service-role admin client (the app uses NextAuth).

CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  idea TEXT NOT NULL,
  current_stage TEXT NOT NULL DEFAULT 'shape',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);

CREATE TABLE IF NOT EXISTS public.stage_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  summary TEXT NOT NULL,
  verdict TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stage_summaries_business_id ON public.stage_summaries(business_id);

-- RLS on; real access is the service-role admin client, which bypasses RLS.
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_summaries ENABLE ROW LEVEL SECURITY;
