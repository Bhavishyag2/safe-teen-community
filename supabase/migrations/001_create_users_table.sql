-- Migration: Create users table
-- Description: Core user table with pseudo-names, avatars, and verification status

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'banned');
CREATE TYPE age_group AS ENUM ('13-15', '16-18', '19+');
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication (links to Supabase Auth)
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity (anonymous)
  pseudo_name VARCHAR(50) UNIQUE NOT NULL,
  avatar_id VARCHAR(100),
  avatar_url TEXT,

  -- Contact (private)
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_domain VARCHAR(100), -- For school email verification

  -- Verification
  id_verified BOOLEAN DEFAULT FALSE,
  id_verification_provider VARCHAR(50), -- 'idfy', 'digilocker', 'manual'
  id_verified_at TIMESTAMPTZ,

  -- Age and consent
  age_group age_group,
  date_of_birth DATE, -- Encrypted in application layer
  parent_email VARCHAR(255),
  parent_consent BOOLEAN DEFAULT FALSE,
  parent_consent_at TIMESTAMPTZ,

  -- Preferences and settings
  preferences JSONB DEFAULT '{
    "notifications": {
      "push": true,
      "email": true,
      "messages": true,
      "mentions": true
    },
    "privacy": {
      "showOnlineStatus": false,
      "allowMessages": "everyone"
    },
    "content": {
      "sections": []
    }
  }'::jsonb,

  -- Role and status
  role user_role DEFAULT 'user',
  status user_status DEFAULT 'pending',

  -- Activity tracking
  last_seen_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_pseudo_name ON users(pseudo_name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email_domain ON users(email_domain);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

-- Policy: Users can read public profile info of other active users
CREATE POLICY "Users can view public profiles"
  ON users FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.status = 'active'
    )
  );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Policy: Moderators and admins can read all users
CREATE POLICY "Moderators can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('moderator', 'admin')
    )
  );

-- Policy: Admins can update any user
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Function to generate unique pseudo-name
CREATE OR REPLACE FUNCTION generate_pseudo_name()
RETURNS VARCHAR(50) AS $$
DECLARE
  adjectives TEXT[] := ARRAY[
    'Happy', 'Sunny', 'Sparkly', 'Dreamy', 'Cozy', 'Brave', 'Clever', 'Gentle',
    'Joyful', 'Lucky', 'Magical', 'Peaceful', 'Radiant', 'Sweet', 'Bright',
    'Cheerful', 'Curious', 'Graceful', 'Lovely', 'Serene', 'Vibrant', 'Wise'
  ];
  nouns TEXT[] := ARRAY[
    'Star', 'Moon', 'Butterfly', 'Rainbow', 'Flower', 'Cloud', 'Pearl', 'Crystal',
    'Dove', 'Panda', 'Kitten', 'Dolphin', 'Phoenix', 'Unicorn', 'Rose', 'Lily',
    'Daisy', 'Willow', 'Aurora', 'Melody', 'Harmony', 'Dream', 'Wish', 'Hope'
  ];
  new_name VARCHAR(50);
  counter INTEGER := 0;
BEGIN
  LOOP
    new_name := adjectives[1 + floor(random() * array_length(adjectives, 1))::int] ||
                nouns[1 + floor(random() * array_length(nouns, 1))::int] ||
                floor(random() * 1000)::text;

    -- Check if name exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE pseudo_name = new_name) THEN
      RETURN new_name;
    END IF;

    counter := counter + 1;
    IF counter > 100 THEN
      -- Fallback with UUID suffix
      RETURN 'User' || substring(gen_random_uuid()::text, 1, 8);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile after auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  email_dom VARCHAR(100);
BEGIN
  -- Extract email domain
  email_dom := split_part(NEW.email, '@', 2);

  INSERT INTO public.users (auth_id, email, email_domain, pseudo_name)
  VALUES (
    NEW.id,
    NEW.email,
    email_dom,
    generate_pseudo_name()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMENT ON TABLE users IS 'User profiles with anonymous identities for the teen portal';
