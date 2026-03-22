
-- ═══════════════════════════════════════════════════════════
-- PHASE A: Stateful Concierge Backend
-- ═══════════════════════════════════════════════════════════

-- 1. guest_profiles
CREATE TABLE public.guest_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text NOT NULL UNIQUE,
  first_name text,
  visit_count integer NOT NULL DEFAULT 1,
  is_returning boolean NOT NULL DEFAULT false,
  last_context jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_profiles ENABLE ROW LEVEL SECURITY;

-- Service role can do everything; anon cannot read
CREATE POLICY "Service role full access on guest_profiles"
  ON public.guest_profiles FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- 2. conversations
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_profile_id uuid NOT NULL REFERENCES public.guest_profiles(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'chat',
  status text NOT NULL DEFAULT 'active',
  concierge_context jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on conversations"
  ON public.conversations FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- 3. messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  source text NOT NULL DEFAULT 'chat',
  latency_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on messages"
  ON public.messages FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- 4. Harden existing tables: remove unsafe anon SELECT on sessions
DROP POLICY IF EXISTS "Allow anonymous select on sessions" ON public.sessions;

-- 5. Remove anon insert on leads (should go through edge functions)
DROP POLICY IF EXISTS "Allow anonymous inserts on leads" ON public.leads;

-- Add service_role full access to leads
CREATE POLICY "Service role full access on leads"
  ON public.leads FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Add service_role full access to sessions  
CREATE POLICY "Service role full access on sessions"
  ON public.sessions FOR ALL
  TO service_role USING (true) WITH CHECK (true);
