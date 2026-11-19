-- =============================================================================
-- Qoncepto Migration: Fraud-Proof Watch-Hour Telemetry & Teacher Bonus View
-- =============================================================================
-- 1. Creates `public.video_watch_logs` with daily per-user per-topic uniqueness.
-- 2. Creates atomic `public.log_watch_heartbeat()` RPC capped at 2x video duration.
-- 3. Creates `public.teacher_watch_hours_report` SQL view for monthly payouts.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.video_watch_logs (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id               uuid NOT NULL REFERENCES public.subject_note_topics(id) ON DELETE CASCADE,
  subject_id             uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  log_date               date NOT NULL DEFAULT CURRENT_DATE,
  seconds_watched        integer NOT NULL DEFAULT 0 CHECK (seconds_watched >= 0),
  video_duration_seconds integer CHECK (video_duration_seconds IS NULL OR video_duration_seconds > 0),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_watch_logs_user_video_date_unique UNIQUE (user_id, video_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_video_watch_logs_subject_date
  ON public.video_watch_logs (subject_id, log_date);

CREATE INDEX IF NOT EXISTS idx_video_watch_logs_user_video
  ON public.video_watch_logs (user_id, video_id);

ALTER TABLE public.video_watch_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can read own watch logs" ON public.video_watch_logs;
CREATE POLICY "Students can read own watch logs"
  ON public.video_watch_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Optional teacher mapping column on subjects if not already present
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS teacher_id uuid;

CREATE OR REPLACE FUNCTION public.log_watch_heartbeat(
  p_user_id        uuid,
  p_video_id       uuid,
  p_subject_id     uuid,
  p_increment      integer DEFAULT 30,
  p_video_duration integer DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid      uuid;
  v_safe_inc      integer;
  v_cap_seconds   integer;
  v_new_total     integer;
BEGIN
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NULL OR v_auth_uid <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized watch heartbeat';
  END IF;

  -- Clamp each heartbeat increment to [1, 60] seconds
  v_safe_inc := LEAST(GREATEST(COALESCE(p_increment, 30), 1), 60);

  -- Fraud cap: 2x video duration (fallback cap 4 hours = 14400s if duration unknown)
  v_cap_seconds := CASE
    WHEN p_video_duration IS NOT NULL AND p_video_duration > 0
      THEN GREATEST(p_video_duration * 2, 120)
    ELSE 14400
  END;

  INSERT INTO public.video_watch_logs (
    user_id,
    video_id,
    subject_id,
    log_date,
    seconds_watched,
    video_duration_seconds,
    updated_at
  )
  VALUES (
    p_user_id,
    p_video_id,
    p_subject_id,
    CURRENT_DATE,
    LEAST(v_safe_inc, v_cap_seconds),
    p_video_duration,
    now()
  )
  ON CONFLICT (user_id, video_id, log_date) DO UPDATE
  SET
    seconds_watched = LEAST(
      public.video_watch_logs.seconds_watched + v_safe_inc,
      v_cap_seconds
    ),
    video_duration_seconds = COALESCE(
      EXCLUDED.video_duration_seconds,
      public.video_watch_logs.video_duration_seconds
    ),
    updated_at = now()
  RETURNING seconds_watched INTO v_new_total;

  RETURN v_new_total;
END;
$$;

REVOKE ALL ON FUNCTION public.log_watch_heartbeat(uuid, uuid, uuid, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_watch_heartbeat(uuid, uuid, uuid, integer, integer) TO authenticated;

CREATE OR REPLACE VIEW public.teacher_watch_hours_report
WITH (security_invoker = true) AS
SELECT
  l.subject_id,
  s.code AS subject_code,
  s.name AS subject_name,
  s.teacher_id,
  date_trunc('month', l.log_date)::date AS report_month,
  COUNT(DISTINCT l.user_id) AS unique_students,
  SUM(l.seconds_watched) AS total_seconds_watched,
  ROUND((SUM(l.seconds_watched) / 3600.0)::numeric, 2) AS total_hours_watched
FROM public.video_watch_logs l
JOIN public.subjects s ON s.id = l.subject_id
GROUP BY
  l.subject_id,
  s.code,
  s.name,
  s.teacher_id,
  date_trunc('month', l.log_date)::date;

REVOKE ALL ON public.teacher_watch_hours_report FROM anon, authenticated;

COMMIT;
