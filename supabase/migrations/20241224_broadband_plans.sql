-- Broadband Plans table for FCC Nutrition Label data
-- This schema follows the FCC Broadband Consumer Labels format

CREATE TABLE IF NOT EXISTS broadband_plans (
  id SERIAL PRIMARY KEY,

  -- FCC Unique Identifier
  fcc_plan_id VARCHAR(100) UNIQUE NOT NULL,

  -- Provider Info
  provider_name VARCHAR(255) NOT NULL,
  provider_id INTEGER REFERENCES providers(id),

  -- Plan Names
  service_plan_name VARCHAR(255) NOT NULL,
  tier_plan_name VARCHAR(255),

  -- Connection Type: Fixed, Mobile, Satellite
  connection_type VARCHAR(50) NOT NULL,

  -- Service Type: residential, business, mobile
  service_type VARCHAR(50) NOT NULL DEFAULT 'residential',

  -- Pricing
  monthly_price DECIMAL(10, 2) NOT NULL,
  has_intro_rate BOOLEAN DEFAULT FALSE,
  intro_rate_price DECIMAL(10, 2),
  intro_rate_months INTEGER,

  -- Contract Terms
  contract_required BOOLEAN DEFAULT FALSE,
  contract_months INTEGER,
  contract_terms_url TEXT,
  early_termination_fee DECIMAL(10, 2) DEFAULT 0,

  -- One-time Fees (stored as JSONB array)
  -- Example: [{"name": "Activation Fee", "amount": 20.00}, {"name": "Install", "amount": 65.00}]
  one_time_fees JSONB DEFAULT '[]'::jsonb,

  -- Monthly Fees (stored as JSONB array)
  -- Example: [{"name": "WiFi Service", "amount": 10.00}]
  monthly_fees JSONB DEFAULT '[]'::jsonb,

  -- Taxes: "Taxes Included", "0.00", or description
  tax_info VARCHAR(255),

  -- Speeds (in Mbps)
  typical_download_speed INTEGER,
  typical_upload_speed INTEGER,
  typical_latency INTEGER, -- in milliseconds

  -- Data Allowance
  monthly_data_gb INTEGER, -- NULL means unlimited
  overage_price_per_gb DECIMAL(10, 2),
  overage_increment_gb INTEGER,

  -- Policy URLs
  bundle_discounts_url TEXT,
  data_allowance_policy_url TEXT,
  network_management_url TEXT,
  privacy_policy_url TEXT,

  -- Customer Support
  support_phone VARCHAR(50),
  support_url TEXT,

  -- Metadata
  data_source VARCHAR(100) DEFAULT 'fcc_broadband_labels',
  source_file VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_broadband_plans_provider ON broadband_plans(provider_name);
CREATE INDEX IF NOT EXISTS idx_broadband_plans_provider_id ON broadband_plans(provider_id);
CREATE INDEX IF NOT EXISTS idx_broadband_plans_connection_type ON broadband_plans(connection_type);
CREATE INDEX IF NOT EXISTS idx_broadband_plans_service_type ON broadband_plans(service_type);
CREATE INDEX IF NOT EXISTS idx_broadband_plans_price ON broadband_plans(monthly_price);
CREATE INDEX IF NOT EXISTS idx_broadband_plans_download_speed ON broadband_plans(typical_download_speed);
CREATE INDEX IF NOT EXISTS idx_broadband_plans_active ON broadband_plans(is_active);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_broadband_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_broadband_plans_updated_at
  BEFORE UPDATE ON broadband_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_broadband_plans_updated_at();

-- Enable Row Level Security (read-only for anonymous users)
ALTER TABLE broadband_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on broadband_plans"
  ON broadband_plans
  FOR SELECT
  TO anon
  USING (is_active = TRUE);

CREATE POLICY "Allow service role full access on broadband_plans"
  ON broadband_plans
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

COMMENT ON TABLE broadband_plans IS 'Internet service plans from FCC Broadband Consumer Labels';
COMMENT ON COLUMN broadband_plans.fcc_plan_id IS 'Unique plan identifier from FCC label data';
COMMENT ON COLUMN broadband_plans.one_time_fees IS 'JSONB array of one-time fees like activation, install';
COMMENT ON COLUMN broadband_plans.monthly_fees IS 'JSONB array of monthly add-on fees like WiFi rental';
COMMENT ON COLUMN broadband_plans.monthly_data_gb IS 'NULL means unlimited data';
