-- Phase 2 cleanup: remove legacy tables from previous development iterations.
-- Safe to run — uses IF EXISTS, no data loss on fresh databases.
DROP TABLE IF EXISTS project_images CASCADE;
DROP TABLE IF EXISTS cv_files CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profile CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Legacy tables from Phase 2 pre-release (if partially created)
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS education CASCADE;
DROP TABLE IF EXISTS experience CASCADE;
DROP TABLE IF EXISTS social_links CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS visitor_logs CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
