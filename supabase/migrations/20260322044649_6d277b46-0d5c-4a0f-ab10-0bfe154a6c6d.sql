
-- Align guest_profiles with the expanded schema
ALTER TABLE public.guest_profiles ALTER COLUMN fingerprint DROP NOT NULL;
ALTER TABLE public.guest_profiles ALTER COLUMN visit_count SET DEFAULT 0;

ALTER TABLE public.guest_profiles ADD COLUMN IF NOT EXISTS phone text UNIQUE;
ALTER TABLE public.guest_profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.guest_profiles ADD COLUMN IF NOT EXISTS preferred_categories text[];
ALTER TABLE public.guest_profiles ADD COLUMN IF NOT EXISTS preferred_artist_ids text[];
ALTER TABLE public.guest_profiles ADD COLUMN IF NOT EXISTS intent_score numeric(3,2);
ALTER TABLE public.guest_profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;
ALTER TABLE public.guest_profiles ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.guest_profiles ADD COLUMN IF NOT EXISTS notes text;

-- Keep last_context and updated_at (existing columns your schema didn't include but are useful)

-- Create indexes if missing
CREATE INDEX IF NOT EXISTS idx_guest_profiles_phone ON public.guest_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_fingerprint ON public.guest_profiles(fingerprint);
