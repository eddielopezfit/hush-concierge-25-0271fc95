-- Restrict anon access to artists table; expose safe columns via a view
DROP POLICY IF EXISTS artists_anon_select_active ON public.artists;

CREATE OR REPLACE VIEW public.artists_public
WITH (security_invoker = true) AS
SELECT
  id, name, role, department, specialty, specialties,
  service_categories, service_category, badge, known_for,
  fit_statement, best_for, description, is_primary_booking,
  is_active, created_at, updated_at
FROM public.artists
WHERE is_active = true;

GRANT SELECT ON public.artists_public TO anon, authenticated;