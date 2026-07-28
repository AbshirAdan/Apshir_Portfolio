ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS category VARCHAR(120),
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS reading_time INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS seo_title VARCHAR(150),
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

UPDATE blogs
SET
  excerpt = COALESCE(excerpt, LEFT(REGEXP_REPLACE(content, '\s+', ' ', 'g'), 180)),
  category = COALESCE(category, 'General'),
  tags = COALESCE(tags, '{}'),
  status = CASE WHEN published = true THEN 'published' ELSE 'draft' END,
  reading_time = GREATEST(1, CEIL(NULLIF(array_length(regexp_split_to_array(TRIM(content), E'\\s+'), 1), 0) / 200.0)::int),
  featured = COALESCE(featured, false)
WHERE
  excerpt IS NULL
  OR category IS NULL
  OR status IS NULL
  OR reading_time IS NULL
  OR featured IS NULL;

ALTER TABLE blogs
  ALTER COLUMN category SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(featured) WHERE published = true;
