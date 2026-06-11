-- Migration: Create moderation queue and related tables
-- Description: Content moderation system with AI scoring and human review

CREATE TYPE queue_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'escalated');
CREATE TYPE queue_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE report_reason AS ENUM (
  'harassment',
  'inappropriate_content',
  'spam',
  'misinformation',
  'self_harm',
  'violence',
  'personal_info',
  'underage_content',
  'other'
);

-- Moderation queue table
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content reference
  content_type VARCHAR(50) NOT NULL, -- 'content', 'comment', 'message', 'user'
  content_id UUID NOT NULL,

  -- AI moderation results
  ai_score DECIMAL(3,2), -- 0.00 to 1.00 (higher = more likely to be problematic)
  ai_flags TEXT[], -- ['toxicity', 'sexual', 'violence', etc.]
  ai_categories JSONB, -- Detailed category scores
  ai_provider VARCHAR(50), -- 'perspective', 'openai', etc.

  -- Priority and status
  priority queue_priority DEFAULT 'normal',
  status queue_status DEFAULT 'pending',

  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,

  -- Review
  reviewed_at TIMESTAMPTZ,
  decision VARCHAR(20), -- 'approve', 'reject', 'edit', 'escalate'
  notes TEXT,

  -- For rejections
  rejection_reason TEXT,
  notify_user BOOLEAN DEFAULT TRUE,

  -- Metadata
  reported_by UUID REFERENCES users(id), -- NULL if AI-flagged
  report_reason report_reason,
  report_details TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mod_queue_status ON moderation_queue(status);
CREATE INDEX idx_mod_queue_priority ON moderation_queue(priority);
CREATE INDEX idx_mod_queue_assigned ON moderation_queue(assigned_to);
CREATE INDEX idx_mod_queue_content ON moderation_queue(content_type, content_id);
CREATE INDEX idx_mod_queue_created ON moderation_queue(created_at DESC);

-- Composite index for moderator dashboard
CREATE INDEX idx_mod_queue_status_priority ON moderation_queue(status, priority DESC, created_at);

-- Apply trigger
CREATE TRIGGER update_moderation_queue_updated_at
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-prioritize based on AI score
CREATE OR REPLACE FUNCTION set_moderation_priority()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ai_score IS NOT NULL THEN
    IF NEW.ai_score >= 0.9 THEN
      NEW.priority := 'urgent';
    ELSIF NEW.ai_score >= 0.7 THEN
      NEW.priority := 'high';
    ELSIF NEW.ai_score >= 0.5 THEN
      NEW.priority := 'normal';
    ELSE
      NEW.priority := 'low';
    END IF;
  END IF;

  -- User reports are at least normal priority
  IF NEW.reported_by IS NOT NULL AND NEW.priority = 'low' THEN
    NEW.priority := 'normal';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_moderation_priority_trigger
  BEFORE INSERT OR UPDATE OF ai_score ON moderation_queue
  FOR EACH ROW
  EXECUTE FUNCTION set_moderation_priority();

-- Reports table (user reports)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reporter
  reporter_id UUID NOT NULL REFERENCES users(id),

  -- Reported content
  content_type VARCHAR(50) NOT NULL,
  content_id UUID NOT NULL,
  reported_user_id UUID REFERENCES users(id), -- The user being reported

  -- Report details
  reason report_reason NOT NULL,
  details TEXT,
  evidence_urls TEXT[], -- Screenshots, etc.

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'actioned', 'dismissed'
  moderation_queue_id UUID REFERENCES moderation_queue(id),

  -- Resolution
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  action_taken VARCHAR(50), -- 'warning', 'content_removed', 'user_suspended', etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_content ON reports(content_type, content_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

-- Function to create moderation queue entry from report
CREATE OR REPLACE FUNCTION create_queue_from_report()
RETURNS TRIGGER AS $$
DECLARE
  queue_id UUID;
BEGIN
  -- Check if content already in queue
  SELECT id INTO queue_id
  FROM moderation_queue
  WHERE content_type = NEW.content_type
    AND content_id = NEW.content_id
    AND status IN ('pending', 'in_review');

  IF queue_id IS NOT NULL THEN
    -- Update existing queue entry
    UPDATE moderation_queue
    SET priority = 'high', -- Escalate priority
        updated_at = NOW()
    WHERE id = queue_id;

    NEW.moderation_queue_id := queue_id;
  ELSE
    -- Create new queue entry
    INSERT INTO moderation_queue (
      content_type,
      content_id,
      reported_by,
      report_reason,
      report_details,
      priority
    ) VALUES (
      NEW.content_type,
      NEW.content_id,
      NEW.reporter_id,
      NEW.reason,
      NEW.details,
      'normal'
    ) RETURNING id INTO queue_id;

    NEW.moderation_queue_id := queue_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_queue_from_report_trigger
  BEFORE INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION create_queue_from_report();

-- Moderation actions log
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Moderator
  moderator_id UUID NOT NULL REFERENCES users(id),

  -- Target
  target_type VARCHAR(50) NOT NULL, -- 'user', 'content', 'comment', 'message'
  target_id UUID NOT NULL,
  target_user_id UUID REFERENCES users(id), -- The affected user

  -- Action
  action VARCHAR(50) NOT NULL, -- 'approve', 'reject', 'warn', 'suspend', 'ban', 'edit'
  reason TEXT,

  -- Previous state (for audit)
  previous_state JSONB,
  new_state JSONB,

  -- Related
  moderation_queue_id UUID REFERENCES moderation_queue(id),
  report_id UUID REFERENCES reports(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mod_actions_moderator ON moderation_actions(moderator_id);
CREATE INDEX idx_mod_actions_target ON moderation_actions(target_type, target_id);
CREATE INDEX idx_mod_actions_created ON moderation_actions(created_at DESC);

-- User warnings table
CREATE TABLE user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id),
  issued_by UUID NOT NULL REFERENCES users(id),

  -- Warning details
  reason TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'warning', -- 'warning', 'final_warning'

  -- Related
  moderation_action_id UUID REFERENCES moderation_actions(id),

  -- Acknowledgment
  acknowledged_at TIMESTAMPTZ,

  -- Timestamps
  expires_at TIMESTAMPTZ, -- Warnings can expire
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_warnings_user ON user_warnings(user_id);

-- Row Level Security
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_warnings ENABLE ROW LEVEL SECURITY;

-- Moderation queue policies
CREATE POLICY "Moderators can view queue"
  ON moderation_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Moderators can update queue"
  ON moderation_queue FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "System can insert queue"
  ON moderation_queue FOR INSERT
  WITH CHECK (TRUE); -- Controlled via application layer

-- Reports policies
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (
    reporter_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (
    reporter_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Moderators can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Moderators can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

-- Moderation actions policies
CREATE POLICY "Moderators can view actions"
  ON moderation_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Moderators can create actions"
  ON moderation_actions FOR INSERT
  WITH CHECK (
    moderator_id IN (
      SELECT id FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('moderator', 'admin')
    )
  );

-- User warnings policies
CREATE POLICY "Users can view own warnings"
  ON user_warnings FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Moderators can view all warnings"
  ON user_warnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Moderators can create warnings"
  ON user_warnings FOR INSERT
  WITH CHECK (
    issued_by IN (
      SELECT id FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('moderator', 'admin')
    )
  );

COMMENT ON TABLE moderation_queue IS 'Queue for content pending moderation review';
COMMENT ON TABLE reports IS 'User-submitted reports of content or users';
COMMENT ON TABLE moderation_actions IS 'Audit log of all moderation actions';
COMMENT ON TABLE user_warnings IS 'Warnings issued to users';
