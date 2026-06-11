-- Migration: Create content table
-- Description: Articles, forum posts, and questions with moderation support

-- Create enum types for content
CREATE TYPE content_type AS ENUM ('article', 'forum_post', 'question', 'poll', 'quiz', 'resource');
CREATE TYPE content_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'archived');
CREATE TYPE content_section AS ENUM (
  'relationships',
  'fashion',
  'health',
  'school',
  'career',
  'period_health',
  'beauty_selfcare'
);

-- Create content table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content type and categorization
  type content_type NOT NULL,
  section content_section NOT NULL,

  -- Content data
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(300) UNIQUE,
  body TEXT NOT NULL,
  excerpt TEXT, -- Short preview text
  cover_image_url TEXT,

  -- Author
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN DEFAULT TRUE, -- Show pseudo-name or "Anonymous"

  -- Moderation
  status content_status DEFAULT 'pending',
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Organization
  tags TEXT[] DEFAULT '{}',
  subcategory VARCHAR(100),

  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,

  -- Flags
  is_featured BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_expert_content BOOLEAN DEFAULT FALSE, -- Written by verified expert
  allow_comments BOOLEAN DEFAULT TRUE,

  -- SEO/Meta
  meta_description TEXT,
  meta_keywords TEXT[],

  -- Poll/Quiz specific data (stored as JSONB)
  poll_data JSONB, -- { options: [...], votes: {...}, endsAt: ... }
  quiz_data JSONB, -- { questions: [...], answers: {...} }

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_section ON content(section);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_author ON content(author_id);
CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_tags ON content USING GIN(tags);
CREATE INDEX idx_content_created_at ON content(created_at DESC);
CREATE INDEX idx_content_published_at ON content(published_at DESC);
CREATE INDEX idx_content_featured ON content(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_content_pinned ON content(is_pinned) WHERE is_pinned = TRUE;

-- Composite indexes for common queries
CREATE INDEX idx_content_section_status ON content(section, status);
CREATE INDEX idx_content_section_type ON content(section, type);

-- Apply updated_at trigger
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_content_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug VARCHAR(300);
  new_slug VARCHAR(300);
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from title
  base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := substring(base_slug, 1, 250);

  new_slug := base_slug;

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM content WHERE slug = new_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_content_slug_trigger
  BEFORE INSERT OR UPDATE OF title ON content
  FOR EACH ROW
  EXECUTE FUNCTION generate_content_slug();

-- Row Level Security
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read approved content
CREATE POLICY "Anyone can view approved content"
  ON content FOR SELECT
  USING (status = 'approved');

-- Policy: Authors can read their own content
CREATE POLICY "Authors can view own content"
  ON content FOR SELECT
  USING (
    author_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Policy: Authors can create content
CREATE POLICY "Authenticated users can create content"
  ON content FOR INSERT
  WITH CHECK (
    author_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Authors can update their pending/draft content
CREATE POLICY "Authors can update own pending content"
  ON content FOR UPDATE
  USING (
    author_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
    AND status IN ('draft', 'pending', 'rejected')
  );

-- Policy: Authors can delete their draft content
CREATE POLICY "Authors can delete own draft content"
  ON content FOR DELETE
  USING (
    author_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
    AND status = 'draft'
  );

-- Policy: Moderators can read all content
CREATE POLICY "Moderators can view all content"
  ON content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

-- Policy: Moderators can update content status
CREATE POLICY "Moderators can update content"
  ON content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

-- Create content_likes table for tracking likes
CREATE TABLE content_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

CREATE INDEX idx_content_likes_content ON content_likes(content_id);
CREATE INDEX idx_content_likes_user ON content_likes(user_id);

-- RLS for content_likes
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view likes"
  ON content_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can like content"
  ON content_likes FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can unlike content"
  ON content_likes FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_content_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE content SET likes_count = likes_count + 1 WHERE id = NEW.content_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE content SET likes_count = likes_count - 1 WHERE id = OLD.content_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON content_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_content_likes_count();

-- Create content_bookmarks table
CREATE TABLE content_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

CREATE INDEX idx_content_bookmarks_user ON content_bookmarks(user_id);

ALTER TABLE content_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON content_bookmarks FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can bookmark content"
  ON content_bookmarks FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can remove bookmarks"
  ON content_bookmarks FOR DELETE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

COMMENT ON TABLE content IS 'All content types: articles, forum posts, questions, polls, quizzes';
COMMENT ON TABLE content_likes IS 'Tracks user likes on content';
COMMENT ON TABLE content_bookmarks IS 'Tracks user bookmarks on content';
