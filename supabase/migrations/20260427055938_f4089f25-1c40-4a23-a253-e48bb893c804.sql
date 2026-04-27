
-- Try-On sessions table
CREATE TABLE public.try_on_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_profile_id UUID NULL,
  source_image_path TEXT NULL,
  chosen_styles JSONB NOT NULL DEFAULT '[]'::jsonb,
  converted_to_lead BOOLEAN NOT NULL DEFAULT false,
  last_style_id TEXT NULL,
  last_color_id TEXT NULL,
  last_render_path TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.try_on_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "try_on_sessions_service_role_all"
  ON public.try_on_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Reuse / create timestamp trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_try_on_sessions_updated_at
BEFORE UPDATE ON public.try_on_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_try_on_sessions_guest_profile ON public.try_on_sessions(guest_profile_id);
CREATE INDEX idx_try_on_sessions_created_at    ON public.try_on_sessions(created_at DESC);

-- Private storage bucket for uploads + AI renders
INSERT INTO storage.buckets (id, name, public)
VALUES ('try-on-renders', 'try-on-renders', false)
ON CONFLICT (id) DO NOTHING;

-- Service-role only access to the bucket objects
CREATE POLICY "try_on_renders_service_role_select"
  ON storage.objects FOR SELECT TO service_role
  USING (bucket_id = 'try-on-renders');

CREATE POLICY "try_on_renders_service_role_insert"
  ON storage.objects FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'try-on-renders');

CREATE POLICY "try_on_renders_service_role_update"
  ON storage.objects FOR UPDATE TO service_role
  USING (bucket_id = 'try-on-renders')
  WITH CHECK (bucket_id = 'try-on-renders');

CREATE POLICY "try_on_renders_service_role_delete"
  ON storage.objects FOR DELETE TO service_role
  USING (bucket_id = 'try-on-renders');
