
-- ═══════════════════════════════════════════════════════════
-- Phase B: knowledge_items, artists, services tables
-- ═══════════════════════════════════════════════════════════

-- 1. knowledge_items — Supabase as source of truth for Luna KB
CREATE TABLE IF NOT EXISTS public.knowledge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  elevenlabs_doc_id text,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_items_category ON public.knowledge_items(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_active ON public.knowledge_items(is_active) WHERE is_active = true;

-- 2. artists — backend-owned artist catalog
CREATE TABLE IF NOT EXISTS public.artists (
  id text PRIMARY KEY,
  name text NOT NULL,
  department text NOT NULL,
  role text NOT NULL,
  specialty text NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}',
  description text,
  best_for text,
  fit_statement text,
  known_for text[] NOT NULL DEFAULT '{}',
  badge text,
  service_category text,
  service_categories text[] NOT NULL DEFAULT '{}',
  direct_phone text,
  is_primary_booking boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artists_department ON public.artists(department);
CREATE INDEX IF NOT EXISTS idx_artists_service_category ON public.artists(service_category);
CREATE INDEX IF NOT EXISTS idx_artists_active ON public.artists(is_active) WHERE is_active = true;

-- 3. services — backend-owned service catalog
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text NOT NULL,
  category_title text NOT NULL,
  group_name text NOT NULL,
  name text NOT NULL,
  price text NOT NULL,
  shared_id text,
  cross_categories text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════
-- RLS: service_role full access + anon SELECT for public catalog
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- knowledge_items: service_role only
CREATE POLICY "knowledge_items_service_role_all"
  ON public.knowledge_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- artists: service_role full + anon read active
CREATE POLICY "artists_service_role_all"
  ON public.artists FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "artists_anon_select_active"
  ON public.artists FOR SELECT TO anon
  USING (is_active = true);

-- services: service_role full + anon read active
CREATE POLICY "services_service_role_all"
  ON public.services FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "services_anon_select_active"
  ON public.services FOR SELECT TO anon
  USING (is_active = true);
