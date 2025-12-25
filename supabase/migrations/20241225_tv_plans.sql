-- Create tv_plans table for satellite/cable TV packages
CREATE TABLE IF NOT EXISTS tv_plans (
    id SERIAL PRIMARY KEY,
    plan_id TEXT UNIQUE NOT NULL,
    provider_name TEXT NOT NULL,
    provider_id INTEGER REFERENCES providers(id),
    package_name TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    gemini_fee DECIMAL(10,2) DEFAULT 0,
    rsn_fee_max DECIMAL(10,2) DEFAULT 0,
    total_min DECIMAL(10,2) NOT NULL,
    total_max DECIMAL(10,2) NOT NULL,
    channel_count INTEGER,
    channel_count_text TEXT,
    contract_months INTEGER,
    activation_fee DECIMAL(10,2) DEFAULT 0,
    early_termination_fee TEXT,
    premium_channels TEXT[],
    features TEXT[],
    notes TEXT,
    service_type TEXT DEFAULT 'satellite',
    is_active BOOLEAN DEFAULT true,
    data_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tv_plans_provider ON tv_plans(provider_name);
CREATE INDEX IF NOT EXISTS idx_tv_plans_price ON tv_plans(total_min);
CREATE INDEX IF NOT EXISTS idx_tv_plans_service_type ON tv_plans(service_type);

-- Enable Row Level Security
ALTER TABLE tv_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on tv_plans" ON tv_plans
    FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access on tv_plans" ON tv_plans
    FOR ALL USING (true);
