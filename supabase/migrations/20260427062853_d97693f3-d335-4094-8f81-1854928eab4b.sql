ALTER TABLE public.try_on_sessions
  ADD COLUMN IF NOT EXISTS face_shape text,
  ADD COLUMN IF NOT EXISTS undertone text;

ALTER TABLE public.try_on_sessions
  DROP CONSTRAINT IF EXISTS try_on_sessions_face_shape_check;
ALTER TABLE public.try_on_sessions
  ADD CONSTRAINT try_on_sessions_face_shape_check
  CHECK (face_shape IS NULL OR face_shape IN ('oval','round','square','heart','long','unsure'));

ALTER TABLE public.try_on_sessions
  DROP CONSTRAINT IF EXISTS try_on_sessions_undertone_check;
ALTER TABLE public.try_on_sessions
  ADD CONSTRAINT try_on_sessions_undertone_check
  CHECK (undertone IS NULL OR undertone IN ('cool','warm','neutral','unsure'));

CREATE INDEX IF NOT EXISTS idx_try_on_sessions_face_shape
  ON public.try_on_sessions(face_shape) WHERE face_shape IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_try_on_sessions_undertone
  ON public.try_on_sessions(undertone) WHERE undertone IS NOT NULL;