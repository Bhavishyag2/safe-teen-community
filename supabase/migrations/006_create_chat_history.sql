-- Migration: Create AI chatbot conversation history
-- Description: Store chat history with the AI "fun best friend" chatbot

CREATE TYPE chat_message_role AS ENUM ('user', 'assistant', 'system');

-- Chat sessions with the AI bot
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session metadata
  title VARCHAR(255), -- Auto-generated from first message
  topic content_section, -- If chat is about a specific section

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  ended_at TIMESTAMPTZ,

  -- Crisis detection
  has_crisis_flag BOOLEAN DEFAULT FALSE,
  crisis_escalated_at TIMESTAMPTZ,
  crisis_handled_by UUID REFERENCES users(id), -- Counselor who handled

  -- Feedback
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_active ON chat_sessions(user_id, is_active);
CREATE INDEX idx_chat_sessions_crisis ON chat_sessions(has_crisis_flag) WHERE has_crisis_flag = TRUE;
CREATE INDEX idx_chat_sessions_created ON chat_sessions(created_at DESC);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,

  -- Message
  role chat_message_role NOT NULL,
  content TEXT NOT NULL,

  -- AI metadata
  model_used VARCHAR(50), -- 'claude-3-sonnet', etc.
  tokens_used INTEGER,
  response_time_ms INTEGER,

  -- Safety
  was_filtered BOOLEAN DEFAULT FALSE, -- If message was modified for safety
  original_content TEXT, -- Original if filtered
  safety_flags TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(session_id, created_at);

-- Apply trigger
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate session title
CREATE OR REPLACE FUNCTION set_chat_session_title()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'user' THEN
    UPDATE chat_sessions
    SET title = LEFT(NEW.content, 100)
    WHERE id = NEW.session_id AND title IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_chat_title_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_chat_session_title();

-- Crisis keywords for detection (used by application layer)
CREATE TABLE crisis_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR(100) NOT NULL UNIQUE,
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  category VARCHAR(50), -- 'self_harm', 'abuse', 'emergency'
  response_template TEXT, -- Suggested AI response
  escalate_immediately BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed some crisis keywords
INSERT INTO crisis_keywords (keyword, severity, category, escalate_immediately, response_template) VALUES
  ('suicide', 'high', 'self_harm', TRUE, 'I''m really concerned about what you''re sharing. Please reach out to iCall at 9152987821 or Vandrevala Foundation at 1860-2662-345. They can help.'),
  ('kill myself', 'high', 'self_harm', TRUE, NULL),
  ('want to die', 'high', 'self_harm', TRUE, NULL),
  ('self harm', 'high', 'self_harm', TRUE, NULL),
  ('cutting myself', 'high', 'self_harm', TRUE, NULL),
  ('abuse', 'medium', 'abuse', FALSE, NULL),
  ('hitting me', 'high', 'abuse', TRUE, NULL),
  ('molest', 'high', 'abuse', TRUE, NULL),
  ('rape', 'high', 'abuse', TRUE, NULL),
  ('emergency', 'high', 'emergency', TRUE, NULL);

-- Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_keywords ENABLE ROW LEVEL SECURITY;

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can create chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Chat messages policies
CREATE POLICY "Users can view messages in own sessions"
  ON chat_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in own sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions
      WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      AND is_active = TRUE
    )
  );

-- Crisis keywords - only admins can modify
CREATE POLICY "Anyone can read crisis keywords"
  ON crisis_keywords FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage crisis keywords"
  ON crisis_keywords FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Moderator access to crisis sessions
CREATE POLICY "Moderators can view crisis sessions"
  ON chat_sessions FOR SELECT
  USING (
    has_crisis_flag = TRUE AND
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Moderators can view crisis messages"
  ON chat_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE has_crisis_flag = TRUE
    ) AND
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

COMMENT ON TABLE chat_sessions IS 'AI chatbot conversation sessions';
COMMENT ON TABLE chat_messages IS 'Messages in AI chatbot sessions';
COMMENT ON TABLE crisis_keywords IS 'Keywords to detect crisis situations';
