-- Migration: Create verification and consent tables
-- Description: Age verification, ID verification, and parental consent tracking

CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'failed', 'expired');
CREATE TYPE verification_method AS ENUM ('email_domain', 'idfy', 'digilocker', 'manual');

-- School email domains (whitelist)
CREATE TABLE school_email_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(255) NOT NULL UNIQUE,
  school_name VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  is_verified BOOLEAN DEFAULT TRUE,
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Common Indian school domains
INSERT INTO school_email_domains (domain, school_name, is_verified) VALUES
  ('dpsrkp.net', 'Delhi Public School', TRUE),
  ('davschool.in', 'DAV Schools', TRUE),
  ('kvs.ac.in', 'Kendriya Vidyalaya', TRUE),
  ('nvs.ac.in', 'Navodaya Vidyalaya', TRUE),
  ('rframedu.in', 'Ryan International', TRUE);

CREATE INDEX idx_school_domains ON school_email_domains(domain);

-- Verification requests
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id),

  -- Method and status
  method verification_method NOT NULL,
  status verification_status DEFAULT 'pending',

  -- Request data
  request_payload JSONB, -- Data sent to verification service
  response_payload JSONB, -- Response from service (sanitized)

  -- For email domain verification
  email_domain VARCHAR(100),

  -- For ID verification
  id_type VARCHAR(50), -- 'aadhaar', 'pan', 'student_id'
  id_reference VARCHAR(100), -- Reference ID from provider (hashed)

  -- For manual verification
  document_urls TEXT[], -- Uploaded documents (stored in Supabase Storage)
  rejection_reason TEXT,

  -- Reviewer (for manual)
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,

  -- Expiry
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verification_user ON verification_requests(user_id);
CREATE INDEX idx_verification_status ON verification_requests(status);
CREATE INDEX idx_verification_method ON verification_requests(method);

CREATE TRIGGER update_verification_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update user verification status
CREATE OR REPLACE FUNCTION update_user_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' THEN
    UPDATE users
    SET
      id_verified = TRUE,
      id_verification_provider = NEW.method::text,
      id_verified_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_verification_trigger
  AFTER UPDATE OF status ON verification_requests
  FOR EACH ROW
  WHEN (NEW.status = 'verified')
  EXECUTE FUNCTION update_user_verification();

-- Parental consent tracking
CREATE TABLE parental_consent_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id),

  -- Parent info
  parent_email VARCHAR(255) NOT NULL,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),

  -- Consent status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'verified', 'declined', 'expired'

  -- Verification
  consent_token UUID DEFAULT gen_random_uuid(), -- Token sent to parent
  consent_code VARCHAR(6), -- OTP code
  verification_attempts INTEGER DEFAULT 0,

  -- Consent details
  consented_at TIMESTAMPTZ,
  consent_ip VARCHAR(45),
  consent_user_agent TEXT,

  -- Expiry
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  -- Email tracking
  email_sent_at TIMESTAMPTZ,
  email_opened_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consent_user ON parental_consent_requests(user_id);
CREATE INDEX idx_consent_token ON parental_consent_requests(consent_token);
CREATE INDEX idx_consent_status ON parental_consent_requests(status);
CREATE INDEX idx_consent_parent_email ON parental_consent_requests(parent_email);

CREATE TRIGGER update_consent_updated_at
  BEFORE UPDATE ON parental_consent_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update user consent status
CREATE OR REPLACE FUNCTION update_user_consent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' THEN
    UPDATE users
    SET
      parent_email = NEW.parent_email,
      parent_consent = TRUE,
      parent_consent_at = NEW.consented_at
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_consent_trigger
  AFTER UPDATE OF status ON parental_consent_requests
  FOR EACH ROW
  WHEN (NEW.status = 'verified')
  EXECUTE FUNCTION update_user_consent();

-- Function to check if email domain is a school
CREATE OR REPLACE FUNCTION is_school_email(email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  email_domain VARCHAR;
BEGIN
  email_domain := split_part(email, '@', 2);

  RETURN EXISTS (
    SELECT 1 FROM school_email_domains
    WHERE domain = email_domain AND is_verified = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Function to auto-verify school emails
CREATE OR REPLACE FUNCTION auto_verify_school_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_verified = TRUE AND is_school_email(NEW.email) THEN
    -- Create verification request
    INSERT INTO verification_requests (
      user_id,
      method,
      status,
      email_domain
    ) VALUES (
      NEW.id,
      'email_domain',
      'verified',
      NEW.email_domain
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_verify_school_email_trigger
  AFTER UPDATE OF email_verified ON users
  FOR EACH ROW
  WHEN (NEW.email_verified = TRUE AND OLD.email_verified = FALSE)
  EXECUTE FUNCTION auto_verify_school_email();

-- Row Level Security
ALTER TABLE school_email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE parental_consent_requests ENABLE ROW LEVEL SECURITY;

-- School domains - public read
CREATE POLICY "Anyone can read school domains"
  ON school_email_domains FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage school domains"
  ON school_email_domains FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Verification requests
CREATE POLICY "Users can view own verification requests"
  ON verification_requests FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can create verification requests"
  ON verification_requests FOR INSERT
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Admins can view all verification requests"
  ON verification_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Admins can update verification requests"
  ON verification_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Parental consent
CREATE POLICY "Users can view own consent requests"
  ON parental_consent_requests FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can create consent requests"
  ON parental_consent_requests FOR INSERT
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Public access for consent verification (via token)
CREATE POLICY "Public can verify consent via token"
  ON parental_consent_requests FOR UPDATE
  USING (TRUE) -- Actual verification in application layer
  WITH CHECK (TRUE);

COMMENT ON TABLE school_email_domains IS 'Whitelist of verified school email domains';
COMMENT ON TABLE verification_requests IS 'User age/ID verification requests';
COMMENT ON TABLE parental_consent_requests IS 'Parental consent for users under 16';
