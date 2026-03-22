
-- Align conversations with expanded schema
ALTER TABLE public.conversations ALTER COLUMN guest_profile_id DROP NOT NULL;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_guest_profile_id_fkey;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_guest_profile_id_fkey
  FOREIGN KEY (guest_profile_id) REFERENCES public.guest_profiles(id) ON DELETE SET NULL;

-- Add CHECK constraints for channel and status
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_channel_check;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_channel_check
  CHECK (channel IN ('chat', 'voice', 'text'));

ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_status_check;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_status_check
  CHECK (status IN ('active', 'completed', 'abandoned'));

-- Add new columns
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS first_message text;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS outcome text;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS elevenlabs_session_id text;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS el_duration_secs integer;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS el_cost_credits numeric;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS intent_signals jsonb;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_guest_profile_id ON public.conversations(guest_profile_id);
CREATE INDEX IF NOT EXISTS idx_conversations_elevenlabs_session_id ON public.conversations(elevenlabs_session_id);
