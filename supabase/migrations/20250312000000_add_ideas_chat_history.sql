-- Add chat_history and chat_summary to ideas for draft/resume flow.
-- Draft = chat_history set, polished_content null.

ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS chat_history JSONB,
  ADD COLUMN IF NOT EXISTS chat_summary TEXT;

COMMENT ON COLUMN public.ideas.chat_history IS 'Array of { role, content, options? } for in-progress or saved chat; null when not used.';
COMMENT ON COLUMN public.ideas.chat_summary IS 'Short AI-generated summary of the conversation so far; shown when resuming.';
