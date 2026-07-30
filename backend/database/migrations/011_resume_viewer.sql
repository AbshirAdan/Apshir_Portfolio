-- ============================================================
-- Phase: Professional Resume Viewer — extended metadata
-- ============================================================

ALTER TABLE resumes
  ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS file_size INT,
  ADD COLUMN IF NOT EXISTS page_count INT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE resumes
SET updated_at = created_at
WHERE updated_at IS NULL;

UPDATE resumes r
SET file_name = split_part(r.file_url, '/', array_length(string_to_array(r.file_url, '/'), 1))
WHERE r.file_name IS NULL AND r.file_url IS NOT NULL;
