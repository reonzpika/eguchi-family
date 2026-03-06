-- Add member_id and password_hash for family auth (replacing Clerk).
-- Run this in the Supabase SQL editor or via Supabase CLI.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS member_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash text;

-- Optional: make clerk_id nullable so existing rows remain valid (no-op if column already nullable or missing).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'clerk_id'
  ) THEN
    ALTER TABLE public.users ALTER COLUMN clerk_id DROP NOT NULL;
  END IF;
END $$;

-- Index for lookups by member_id
CREATE UNIQUE INDEX IF NOT EXISTS users_member_id_key ON users (member_id) WHERE member_id IS NOT NULL;
