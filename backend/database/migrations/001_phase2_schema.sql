-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. USERS
-- Portfolio owner / admin accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(50)  NOT NULL DEFAULT 'admin'
                CHECK (role IN ('admin', 'editor')),
  avatar      VARCHAR(500),
  phone       VARCHAR(50),
  bio         TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. PROJECTS  (FK → users)
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             VARCHAR(255) NOT NULL,
  slug              VARCHAR(255) NOT NULL UNIQUE,
  short_description TEXT,
  full_description  TEXT,
  technologies      JSONB DEFAULT '[]'::jsonb,
  github_url        VARCHAR(500),
  live_demo_url     VARCHAR(500),
  thumbnail         VARCHAR(500),
  featured          BOOLEAN DEFAULT false,
  status            VARCHAR(50) DEFAULT 'draft'
                      CHECK (status IN ('draft', 'published', 'archived')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug    ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status  ON projects(status);

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. PROJECT_IMAGES  (FK → projects, CASCADE delete)
-- ============================================================
CREATE TABLE IF NOT EXISTS project_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image      VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);

-- ============================================================
-- 4. SKILLS
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  percentage    INTEGER NOT NULL DEFAULT 0
                  CHECK (percentage >= 0 AND percentage <= 100),
  icon          VARCHAR(255),
  category      VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- ============================================================
-- 5. CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          VARCHAR(255) NOT NULL,
  organization   VARCHAR(255),
  issue_date     DATE,
  credential_url VARCHAR(500),
  image          VARCHAR(500),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. EDUCATION  (FK → users)
-- ============================================================
CREATE TABLE IF NOT EXISTS education (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  school     VARCHAR(255) NOT NULL,
  degree     VARCHAR(255),
  field      VARCHAR(255),
  start_date DATE,
  end_date   DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);

-- ============================================================
-- 7. EXPERIENCE  (FK → users)
-- ============================================================
CREATE TABLE IF NOT EXISTS experience (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  company     VARCHAR(255) NOT NULL,
  position    VARCHAR(255),
  start_date  DATE,
  end_date    DATE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experience_user_id ON experience(user_id);

-- ============================================================
-- 8. BLOGS  (FK → users)
-- ============================================================
CREATE TABLE IF NOT EXISTS blogs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  title       VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  cover_image VARCHAR(500),
  content     TEXT NOT NULL DEFAULT '',
  published   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug      ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);

CREATE TRIGGER trg_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 9. CONTACT_MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  subject    VARCHAR(255),
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON contact_messages(is_read);

-- ============================================================
-- 10. SOCIAL_LINKS
-- ============================================================
CREATE TABLE IF NOT EXISTS social_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform   VARCHAR(100) NOT NULL,
  url        VARCHAR(500) NOT NULL,
  icon       VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. RESUMES
-- ============================================================
CREATE TABLE IF NOT EXISTS resumes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url   VARCHAR(500) NOT NULL,
  version    VARCHAR(50) DEFAULT '1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. VISITOR_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS visitor_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address        VARCHAR(45),
  browser           VARCHAR(255),
  operating_system  VARCHAR(255),
  country           VARCHAR(100),
  device            VARCHAR(100),
  page              VARCHAR(500),
  visited_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitor_logs_visited_at ON visitor_logs(visited_at);

-- ============================================================
-- 13. SETTINGS  (singleton row for site configuration)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title       VARCHAR(255),
  hero_title       VARCHAR(255),
  hero_description TEXT,
  logo             VARCHAR(500),
  favicon          VARCHAR(500),
  primary_color    VARCHAR(50) DEFAULT '#4F46E5',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
