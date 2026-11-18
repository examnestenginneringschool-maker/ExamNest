-- =============================================================================
-- Qoncepto Migration: Topic-Wise R2 / Private Storage PDF & Video DRM Schema
-- =============================================================================
-- 1. Refactors `public.subject_note_topics` to hold partition keys + private
--    Cloudflare R2 storage file paths (`pdf_storage_path`,
--    `video_storage_path`, `is_pdf_downloadable`, `pdf_page_count`).
-- 2. Backfills `subject_id`, `semester_number`, and canonical 4-level R2 paths:
--    `<university>/<subject_code>/unit_<N>_<unit_name>/topic_<X_Y>_<topic_name>.pdf`
-- 3. Permanently removes legacy unused tables `public.subject_note_blocks` and
--    `public.semester_subjects`, and drops `subject_note_units.notes`.
-- =============================================================================

BEGIN;

-- 1. Add Partition & Private Storage DRM Columns to `public.subject_note_topics`
ALTER TABLE public.subject_note_topics
  ADD COLUMN IF NOT EXISTS semester_number     smallint,
  ADD COLUMN IF NOT EXISTS subject_id          uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS pdf_storage_bucket  text NOT NULL DEFAULT 'notes-bucket',
  ADD COLUMN IF NOT EXISTS pdf_storage_path    text,
  ADD COLUMN IF NOT EXISTS pdf_page_count      integer,
  ADD COLUMN IF NOT EXISTS pdf_size_bytes      bigint,
  ADD COLUMN IF NOT EXISTS video_storage_path  text,
  ADD COLUMN IF NOT EXISTS is_pdf_downloadable boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS compiled_notes      jsonb DEFAULT '[]'::jsonb;

-- 2. Backfill `subject_id` and `semester_number` on `subject_note_topics` from parent unit & curriculum
UPDATE public.subject_note_topics t
SET
  subject_id = u.subject_id,
  semester_number = COALESCE(
    (
      SELECT cs.semester_number
      FROM public.curriculum_subjects cs
      WHERE cs.subject_id = u.subject_id
      LIMIT 1
    ),
    1
  )
FROM public.subject_note_units u
WHERE t.note_unit_id = u.id
  AND (t.subject_id IS NULL OR t.semester_number IS NULL);

-- 3. Preserve existing topic content inside `compiled_notes` before dropping `subject_note_blocks`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'subject_note_blocks'
  ) THEN
    UPDATE public.subject_note_topics t
    SET compiled_notes = COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'block_key', b.block_key,
            'block_type', b.block_type,
            'content', b.content,
            'sort_order', b.sort_order
          )
          ORDER BY b.sort_order ASC
        )
        FROM public.subject_note_blocks b
        WHERE b.topic_id = t.id
          AND b.is_active = true
      ),
      '[]'::jsonb
    )
    WHERE t.compiled_notes IS NULL OR t.compiled_notes = '[]'::jsonb;
  END IF;
END $$;

-- 4. Backfill canonical 4-level R2 `pdf_storage_path` for every topic:
--    `makaut/<subject_code_slug>/unit_<N>_<unit_title_slug>/topic_<X_Y>_<topic_title_slug>.pdf`
UPDATE public.subject_note_topics t
SET
  pdf_storage_bucket = 'notes-bucket',
  pdf_storage_path = CONCAT(
    'makaut/',
    TRIM(BOTH '_' FROM REGEXP_REPLACE(LOWER(COALESCE(s.code, 'subject')), '[^a-z0-9]+', '_', 'g')),
    '/unit_',
    u.unit_number,
    '_',
    TRIM(BOTH '_' FROM REGEXP_REPLACE(LOWER(REGEXP_REPLACE(COALESCE(u.title, 'module'), '[''’`]', '', 'g')), '[^a-z0-9]+', '_', 'g')),
    '/topic_',
    TRIM(BOTH '_' FROM REGEXP_REPLACE(LOWER(COALESCE(t.topic_number, '1.1')), '[^a-z0-9]+', '_', 'g')),
    '_',
    TRIM(BOTH '_' FROM REGEXP_REPLACE(LOWER(REGEXP_REPLACE(COALESCE(t.title, 'notes'), '[''’`]', '', 'g')), '[^a-z0-9]+', '_', 'g')),
    '.pdf'
  )
FROM public.subject_note_units u
JOIN public.subjects s ON s.id = u.subject_id
WHERE t.note_unit_id = u.id;

-- 5. Create Composite Partition Index for <1ms Topic Lookups by Semester + Subject + Unit
CREATE INDEX IF NOT EXISTS idx_subject_note_topics_partition
  ON public.subject_note_topics (semester_number, subject_id, note_unit_id, sort_order)
  WHERE is_active = true;

-- 6. Permanently Drop legacy `public.subject_note_blocks`, `public.semester_subjects`, and `subject_note_units.notes`
DROP TABLE IF EXISTS public.subject_note_blocks CASCADE;
DROP TABLE IF EXISTS public.semester_subjects CASCADE;

ALTER TABLE public.subject_note_units
  DROP COLUMN IF EXISTS notes;

COMMIT;
