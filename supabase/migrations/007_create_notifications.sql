-- Migration: Create notifications system
-- Description: Push notifications and in-app notifications

CREATE TYPE notification_type AS ENUM (
  'like',
  'comment',
  'reply',
  'mention',
  'message',
  'follow',
  'content_approved',
  'content_rejected',
  'warning',
  'system'
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Notification type and content
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,

  -- References
  related_content_type VARCHAR(50), -- 'content', 'comment', 'message', 'user'
  related_content_id UUID,
  related_user_id UUID REFERENCES users(id), -- Who triggered this

  -- Deep link
  action_url TEXT, -- In-app navigation path

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Push notification status
  push_sent BOOLEAN DEFAULT FALSE,
  push_sent_at TIMESTAMPTZ,
  push_token_used TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- User's push tokens for mobile notifications
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Token info
  token TEXT NOT NULL,
  platform VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web'
  device_name VARCHAR(100),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, token)
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(user_id, is_active) WHERE is_active = TRUE;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title VARCHAR(255),
  p_body TEXT DEFAULT NULL,
  p_related_content_type VARCHAR(50) DEFAULT NULL,
  p_related_content_id UUID DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  user_prefs JSONB;
BEGIN
  -- Check user preferences
  SELECT preferences->'notifications' INTO user_prefs
  FROM users WHERE id = p_user_id;

  -- Only create if notifications are enabled
  IF user_prefs IS NULL OR (user_prefs->>'push')::boolean != FALSE THEN
    INSERT INTO notifications (
      user_id, type, title, body,
      related_content_type, related_content_id, related_user_id,
      action_url
    ) VALUES (
      p_user_id, p_type, p_title, p_body,
      p_related_content_type, p_related_content_id, p_related_user_id,
      p_action_url
    ) RETURNING id INTO notification_id;

    RETURN notification_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify on content approval
CREATE OR REPLACE FUNCTION notify_content_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    PERFORM create_notification(
      NEW.author_id,
      'content_approved',
      'Your post was approved!',
      'Your ' || NEW.type || ' "' || LEFT(NEW.title, 50) || '" is now live.',
      'content',
      NEW.id,
      NULL,
      '/content/' || NEW.section || '/' || NEW.slug
    );
  ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    PERFORM create_notification(
      NEW.author_id,
      'content_rejected',
      'Your post needs changes',
      'Your ' || NEW.type || ' was not approved. Check feedback for details.',
      'content',
      NEW.id,
      NULL,
      '/my/posts'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_content_status_trigger
  AFTER UPDATE OF status ON content
  FOR EACH ROW
  EXECUTE FUNCTION notify_content_status_change();

-- Trigger to notify on new comment
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  content_author_id UUID;
  content_title VARCHAR(255);
  commenter_name VARCHAR(50);
BEGIN
  -- Get content author
  SELECT author_id, title INTO content_author_id, content_title
  FROM content WHERE id = NEW.content_id;

  -- Get commenter name
  SELECT pseudo_name INTO commenter_name
  FROM users WHERE id = NEW.user_id;

  -- Notify content author (if not self-comment)
  IF content_author_id != NEW.user_id THEN
    PERFORM create_notification(
      content_author_id,
      'comment',
      commenter_name || ' commented on your post',
      LEFT(NEW.text, 100),
      'comment',
      NEW.id,
      NEW.user_id,
      '/content/' || (SELECT section FROM content WHERE id = NEW.content_id) || '/' ||
      (SELECT slug FROM content WHERE id = NEW.content_id) || '#comment-' || NEW.id
    );
  END IF;

  -- If reply, notify parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    DECLARE
      parent_author_id UUID;
    BEGIN
      SELECT user_id INTO parent_author_id
      FROM comments WHERE id = NEW.parent_id;

      IF parent_author_id != NEW.user_id THEN
        PERFORM create_notification(
          parent_author_id,
          'reply',
          commenter_name || ' replied to your comment',
          LEFT(NEW.text, 100),
          'comment',
          NEW.id,
          NEW.user_id,
          '/content/' || (SELECT section FROM content WHERE id = NEW.content_id) || '/' ||
          (SELECT slug FROM content WHERE id = NEW.content_id) || '#comment-' || NEW.id
        );
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_new_comment_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION notify_new_comment();

-- Trigger to notify on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  sender_name VARCHAR(50);
  recipient_id UUID;
BEGIN
  -- Get sender name
  SELECT pseudo_name INTO sender_name
  FROM users WHERE id = NEW.sender_id;

  -- For direct messages, notify all participants except sender
  FOR recipient_id IN
    SELECT user_id FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id
      AND user_id != NEW.sender_id
      AND is_muted = FALSE
      AND left_at IS NULL
  LOOP
    PERFORM create_notification(
      recipient_id,
      'message',
      'New message from ' || sender_name,
      LEFT(NEW.content, 50),
      'message',
      NEW.id,
      NEW.sender_id,
      '/messages/' || NEW.conversation_id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_new_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  WHEN (NEW.moderation_status = 'approved' AND NEW.is_system_message = FALSE)
  EXECUTE FUNCTION notify_new_message();

-- Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE); -- Controlled via application

-- Push tokens policies
CREATE POLICY "Users can view own push tokens"
  ON push_tokens FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can manage own push tokens"
  ON push_tokens FOR ALL
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

COMMENT ON TABLE notifications IS 'In-app and push notifications';
COMMENT ON TABLE push_tokens IS 'User push notification tokens for mobile';
