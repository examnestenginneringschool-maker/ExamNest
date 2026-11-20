-- =============================================================================
-- Qoncepto Migration: Enrich & Auto-Sync `public.student_profiles`
-- =============================================================================
-- 1. Allows `semester_id` and `college_course_department_id` to be NULL so new
--    accounts appear in `public.student_profiles` immediately on sign-up.
-- 2. Adds readable student identity & academic columns for Table Editor / Admin:
--    `full_name`, `email`, `phone`, `university_name`, `college_name`,
--    `course_name`, `department_name`, `semester_number`.
-- 3. Adds Postgres triggers to keep auth metadata & academic names in sync.
-- 4. Removes orphaned/stale test rows not linked to `auth.users` and backfills
--    all current `auth.users` metadata + academic selections.
-- =============================================================================

BEGIN;

-- 1. Allow pre-onboarding rows and add readable columns on `public.student_profiles`
ALTER TABLE public.student_profiles
  ALTER COLUMN semester_id DROP NOT NULL,
  ALTER COLUMN college_course_department_id DROP NOT NULL;

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS full_name       text,
  ADD COLUMN IF NOT EXISTS email           text,
  ADD COLUMN IF NOT EXISTS phone           text,
  ADD COLUMN IF NOT EXISTS university_name text,
  ADD COLUMN IF NOT EXISTS college_name    text,
  ADD COLUMN IF NOT EXISTS course_name     text,
  ADD COLUMN IF NOT EXISTS department_name text,
  ADD COLUMN IF NOT EXISTS semester_number smallint;

CREATE INDEX IF NOT EXISTS idx_student_profiles_email
  ON public.student_profiles (email);

-- 2. Enrichment trigger BEFORE INSERT OR UPDATE on `public.student_profiles`
CREATE OR REPLACE FUNCTION public.enrich_student_profile_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email           text;
  v_meta_full_name  text;
  v_meta_phone      text;
  v_sem_num         smallint;
  v_course_name     text;
  v_college_name    text;
  v_university_name text;
  v_dept_name       text;
BEGIN
  SELECT
    u.email,
    COALESCE(
      NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'name'), '')
    ),
    COALESCE(
      NULLIF(TRIM(u.raw_user_meta_data->>'phone_number'), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'phone'), ''),
      NULLIF(TRIM(u.phone), '')
    )
  INTO v_email, v_meta_full_name, v_meta_phone
  FROM auth.users u
  WHERE u.id::text = NEW.user_id::text;

  NEW.email     := COALESCE(NULLIF(TRIM(NEW.email), ''), v_email);
  NEW.full_name := COALESCE(NULLIF(TRIM(NEW.full_name), ''), v_meta_full_name);
  NEW.phone     := COALESCE(NULLIF(TRIM(NEW.phone), ''), v_meta_phone);

  IF NEW.semester_id IS NOT NULL THEN
    SELECT
      s.semester_number,
      COALESCE(c.short_name, c.name),
      col.name,
      COALESCE(uni.short_name, uni.name)
    INTO v_sem_num, v_course_name, v_college_name, v_university_name
    FROM public.semesters s
    JOIN public.college_courses cc ON cc.id = s.college_course_id
    JOIN public.courses c          ON c.id  = cc.course_id
    JOIN public.colleges col       ON col.id = cc.college_id
    JOIN public.universities uni   ON uni.id = col.university_id
    WHERE s.id = NEW.semester_id;

    NEW.semester_number := v_sem_num;
    NEW.course_name     := v_course_name;
    NEW.college_name    := v_college_name;
    NEW.university_name := v_university_name;
  ELSE
    NEW.semester_number := NULL;
    NEW.course_name     := NULL;
    NEW.college_name    := NULL;
    NEW.university_name := NULL;
  END IF;

  IF NEW.college_course_department_id IS NOT NULL THEN
    SELECT COALESCE(d.short_name, d.name)
    INTO v_dept_name
    FROM public.college_course_departments ccd
    JOIN public.departments d ON d.id = ccd.department_id
    WHERE ccd.id = NEW.college_course_department_id;

    NEW.department_name := v_dept_name;
  ELSE
    NEW.department_name := NULL;
  END IF;

  NEW.updated_at := COALESCE(NEW.updated_at, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enrich_student_profile_row ON public.student_profiles;
CREATE TRIGGER trg_enrich_student_profile_row
  BEFORE INSERT OR UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enrich_student_profile_row();

-- 3. Automatic Auth-to-Student-Profile sync trigger on `auth.users`
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_student_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_phone     text;
BEGIN
  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), '')
  );
  v_phone := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone_number'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''),
    NULLIF(TRIM(NEW.phone), '')
  );

  INSERT INTO public.profiles (user_id, onboarding_completed)
  VALUES (NEW.id::text, false)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.student_profiles (user_id, full_name, email, phone, updated_at)
  VALUES (NEW.id::text, v_full_name, NEW.email, v_phone, now())
  ON CONFLICT (user_id) DO UPDATE
  SET
    full_name  = COALESCE(EXCLUDED.full_name, public.student_profiles.full_name),
    email      = COALESCE(EXCLUDED.email, public.student_profiles.email),
    phone      = COALESCE(EXCLUDED.phone, public.student_profiles.phone),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_auth_user_to_student_profile ON auth.users;
CREATE TRIGGER trg_sync_auth_user_to_student_profile
  AFTER INSERT OR UPDATE OF email, phone, raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_user_to_student_profile();

-- 4. Clean stale/orphan test rows not present in `auth.users` and backfill existing users
-- Optional hard reset if you also want to wipe onboarding stream selections for existing users:
-- TRUNCATE TABLE public.student_profiles;

DELETE FROM public.student_profiles
WHERE user_id::text NOT IN (SELECT id::text FROM auth.users);

DELETE FROM public.profiles
WHERE user_id::text NOT IN (SELECT id::text FROM auth.users);

INSERT INTO public.profiles (user_id, onboarding_completed)
SELECT u.id::text, false
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.student_profiles (user_id, full_name, email, phone, updated_at)
SELECT
  u.id::text,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'name'), '')
  ),
  u.email,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'phone_number'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'phone'), ''),
    NULLIF(TRIM(u.phone), '')
  ),
  now()
FROM auth.users u
ON CONFLICT (user_id) DO UPDATE
SET
  full_name  = EXCLUDED.full_name,
  email      = EXCLUDED.email,
  phone      = EXCLUDED.phone,
  updated_at = now();

COMMIT;
