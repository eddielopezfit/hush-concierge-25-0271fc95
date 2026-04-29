-- Lightweight event log for funnel drop-off analysis.
-- Anonymous: no PII, no auth requirement, no IP storage.
CREATE TABLE public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel TEXT NOT NULL,
  step TEXT NOT NULL,
  session_id TEXT NOT NULL,
  source TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Drop-off reports filter by funnel + step + time window
CREATE INDEX idx_funnel_events_funnel_created
  ON public.funnel_events (funnel, created_at DESC);
CREATE INDEX idx_funnel_events_funnel_step_created
  ON public.funnel_events (funnel, step, created_at DESC);
CREATE INDEX idx_funnel_events_session
  ON public.funnel_events (session_id);

-- Lock down: only the backend writes/reads. Guests never touch this table directly.
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "funnel_events_service_role_all"
  ON public.funnel_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);