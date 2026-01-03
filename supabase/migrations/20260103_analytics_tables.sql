-- Chat Sessions Table for Chat Analytics
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  zip_code TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  message_count INT DEFAULT 0,
  providers_discussed TEXT[] DEFAULT '{}',
  first_message TEXT,
  model TEXT,
  total_input_tokens INT DEFAULT 0,
  total_output_tokens INT DEFAULT 0,
  total_cost DECIMAL(10, 6) DEFAULT 0,
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_zip_code ON chat_sessions(zip_code);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- Affiliate Clicks Table for Affiliate Performance
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_slug TEXT NOT NULL,
  provider_name TEXT,
  link_type TEXT DEFAULT 'website', -- website, phone, plan
  plan_id UUID,
  plan_name TEXT,
  zip_code TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT, -- Hashed for privacy
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for affiliate_clicks
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_provider ON affiliate_clicks(provider_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_zip ON affiliate_clicks(zip_code);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for chat_sessions updated_at
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
