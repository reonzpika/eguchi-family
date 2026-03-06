-- Create users table (required before add_member_auth migration).
-- If you already have this table (e.g. from Clerk), this is a no-op.

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id text,
  name text,
  role text,
  avatar_color text
);

-- Allow service role / anon to use the table (adjust RLS as needed for your app).
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Basic policy: allow read for authenticated/anon if you use Supabase Auth;
-- for NextAuth-only you may rely on service role. Tweak as needed.
CREATE POLICY "Allow read for authenticated"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read for anon"
  ON public.users FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service role full access"
  ON public.users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
