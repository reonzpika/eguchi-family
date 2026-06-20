-- ピコ companion: persistent multi-chat + one shared per-user memory digest.
-- The member can keep many chats; ピコ shares a running memory across all of
-- them and is aware of their app data (businesses, stages, interests).
-- Access is via the service-role admin client (the app uses NextAuth).

CREATE TABLE IF NOT EXISTS public.pico_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pico_conversations_user_id ON public.pico_conversations(user_id);

CREATE TABLE IF NOT EXISTS public.pico_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.pico_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pico_messages_conversation_id ON public.pico_messages(conversation_id);

-- one running memory digest per user (shared across all their chats)
CREATE TABLE IF NOT EXISTS public.pico_memory (
  user_id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS on; real access is the service-role admin client, which bypasses RLS.
ALTER TABLE public.pico_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pico_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pico_memory ENABLE ROW LEVEL SECURITY;
