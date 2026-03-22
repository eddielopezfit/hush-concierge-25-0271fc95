
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS tokens_used integer;
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at ON public.messages(conversation_id, created_at);
