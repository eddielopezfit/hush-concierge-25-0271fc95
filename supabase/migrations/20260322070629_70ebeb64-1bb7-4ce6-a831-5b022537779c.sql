ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS last_summarized_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_summarized_message_count integer NOT NULL DEFAULT 0;