-- Migration: Create comments table
-- Description: Comments on content with threading and moderation

CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'hidden');

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent content
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,

  -- Author
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Threading (for nested replies)
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  thread_depth INTEGER DEFAULT 0,

  -- Comment content
  text TEXT NOT NULL,

  -- Moderation
  status comment_status DEFAULT 'pending',
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,

  -- Engagement
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,

  -- Flags
  is_author_reply BOOLEAN DEFAULT FALSE, -- If content author is replying
  is_pinned BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_content ON comments(content_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Composite index for loading comments on content
CREATE INDEX idx_comments_content_status ON comments(content_id, status);

-- Apply updated_at trigger
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update content comments count
    UPDATE content SET comments_count = comments_count + 1 WHERE id = NEW.content_id;

    -- Update parent comment replies count if this is a reply
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE comments SET replies_count = replies_count + 1 WHERE id = NEW.parent_id;
    END IF;

    -- Set thread depth
    IF NEW.parent_id IS NOT NULL THEN
      NEW.thread_depth := (SELECT thread_depth + 1 FROM comments WHERE id = NEW.parent_id);
    END IF;

    -- Check if author is replying to their own content
    NEW.is_author_reply := EXISTS (
      SELECT 1 FROM content c WHERE c.id = NEW.content_id AND c.author_id = NEW.user_id
    );

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE content SET comments_count = comments_count - 1 WHERE id = OLD.content_id;

    IF OLD.parent_id IS NOT NULL THEN
      UPDATE comments SET replies_count = replies_count - 1 WHERE id = OLD.parent_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_counts_trigger
  BEFORE INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_counts();

CREATE TRIGGER update_comment_counts_delete_trigger
  AFTER DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_counts();

-- Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read approved comments on approved content
CREATE POLICY "Anyone can view approved comments"
  ON comments FOR SELECT
  USING (
    status = 'approved' AND
    EXISTS (SELECT 1 FROM content c WHERE c.id = content_id AND c.status = 'approved')
  );

-- Policy: Users can view their own comments
CREATE POLICY "Users can view own comments"
  ON comments FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Policy: Active users can create comments
CREATE POLICY "Active users can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid() AND status = 'active'
    ) AND
    EXISTS (
      SELECT 1 FROM content c WHERE c.id = content_id AND c.status = 'approved' AND c.allow_comments = TRUE
    )
  );

-- Policy: Users can update their pending comments
CREATE POLICY "Users can update own pending comments"
  ON comments FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    AND status = 'pending'
  );

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Policy: Moderators can view all comments
CREATE POLICY "Moderators can view all comments"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

-- Policy: Moderators can update comments
CREATE POLICY "Moderators can update comments"
  ON comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

-- Comment likes table
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comment likes"
  ON comment_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Update likes count trigger
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_likes_count_trigger
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

COMMENT ON TABLE comments IS 'Comments on content with threading support';
COMMENT ON TABLE comment_likes IS 'Tracks user likes on comments';
