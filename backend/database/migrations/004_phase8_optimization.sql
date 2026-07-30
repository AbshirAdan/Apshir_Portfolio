-- Phase 8: performance indexes and data integrity helpers

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

CREATE INDEX IF NOT EXISTS idx_visitor_logs_page ON visitor_logs(page);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_device ON visitor_logs(device);

CREATE INDEX IF NOT EXISTS idx_skills_display_order ON skills(display_order);
CREATE INDEX IF NOT EXISTS idx_social_links_display_order ON social_links(display_order);

CREATE INDEX IF NOT EXISTS idx_resumes_is_active ON resumes(is_active) WHERE is_active = true;

-- Prevent duplicate slugs (partial unique indexes where not already constrained)
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug_unique ON projects(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_blogs_slug_unique ON blogs(slug);
