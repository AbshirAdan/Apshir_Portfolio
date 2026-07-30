-- ============================================================
-- Add new project fields
-- ============================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS completion_date DATE,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
