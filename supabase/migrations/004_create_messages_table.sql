-- Migration: Create messages and conversations tables
-- Description: Direct messaging with moderation and real-time support

CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'flagged', 'deleted');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'flagged', 'blocked');
CREATE TYPE conversation_type AS ENUM ('direct', 'group');

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type conversation_type DEFAULT 'direct',

  -- Group chat specific
  name VARCHAR(100), -- Only for group chats
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES users(id),

  -- Settings
  is_moderated BOOLEAN DEFAULT TRUE,
  allow_media BOOLEAN DEFAULT TRUE,

  -- Metadata
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  message_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Conversation participants
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Participant status
  is_admin BOOLEAN DEFAULT FALSE, -- For group chats
  is_muted BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,

  -- Read tracking
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ, -- NULL if still in conversation

  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conv_participants_conv ON conversation_participants(conversation_id);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- For direct messages (legacy support)
  receiver_id UUID REFERENCES users(id),

  -- Message content
  content TEXT NOT NULL, -- Consider encrypting in application layer
  content_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file'
  media_url TEXT,

  -- Reply threading
  reply_to_id UUID REFERENCES messages(id),

  -- Status
  status message_status DEFAULT 'sent',
  moderation_status moderation_status DEFAULT 'pending',

  -- Moderation metadata
  ai_moderation_score DECIMAL(3,2), -- 0.00 to 1.00
  ai_moderation_flags TEXT[],
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,

  -- Flags
  is_system_message BOOLEAN DEFAULT FALSE, -- System notifications
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_moderation ON messages(moderation_status);

-- Composite index for conversation messages
CREATE INDEX idx_messages_conv_created ON messages(conversation_id, created_at DESC);

-- Apply triggers
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation metadata
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  -- Increment unread count for all participants except sender
  UPDATE conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
    AND left_at IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to create or get direct conversation
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT c.id INTO conv_id
  FROM conversations c
  JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = user1_id
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = user2_id
  WHERE c.type = 'direct'
  LIMIT 1;

  -- Create new if not exists
  IF conv_id IS NULL THEN
    INSERT INTO conversations (type) VALUES ('direct') RETURNING id INTO conv_id;

    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (conv_id, user1_id), (conv_id, user2_id);
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      JOIN users u ON u.id = cp.user_id
      WHERE cp.conversation_id = id
        AND u.auth_id = auth.uid()
        AND cp.left_at IS NULL
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (TRUE); -- Actual validation in application layer

-- Conversation participants policies
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      JOIN users u ON u.id = cp.user_id
      WHERE cp.conversation_id = conversation_id
        AND u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can update own participation"
  ON conversation_participants FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      JOIN users u ON u.id = cp.user_id
      WHERE cp.conversation_id = conversation_id
        AND u.auth_id = auth.uid()
        AND cp.left_at IS NULL
    )
    AND is_deleted = FALSE
    AND moderation_status != 'blocked'
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid() AND status = 'active'
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_id
        AND cp.user_id = sender_id
        AND cp.left_at IS NULL
        AND cp.is_blocked = FALSE
    )
  );

CREATE POLICY "Users can delete own messages"
  ON messages FOR UPDATE
  USING (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Moderator policies
CREATE POLICY "Moderators can view all messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Moderators can update messages"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

COMMENT ON TABLE conversations IS 'Direct and group conversations';
COMMENT ON TABLE conversation_participants IS 'Users in conversations with read tracking';
COMMENT ON TABLE messages IS 'Messages with moderation support';
