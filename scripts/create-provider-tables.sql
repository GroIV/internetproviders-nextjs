-- Create provider_plans table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS provider_plans (
  id SERIAL PRIMARY KEY,
  provider_slug TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  speed_down TEXT,
  speed_up TEXT,
  price_promo DECIMAL(10,2),
  price_regular DECIMAL(10,2),
  technology TEXT,
  data_cap TEXT,
  contract_length TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_provider_plans_slug ON provider_plans(provider_slug);
CREATE INDEX IF NOT EXISTS idx_provider_plans_technology ON provider_plans(technology);
CREATE INDEX IF NOT EXISTS idx_provider_plans_price ON provider_plans(price_promo);

-- Create provider_promotions table
CREATE TABLE IF NOT EXISTS provider_promotions (
  id SERIAL PRIMARY KEY,
  provider_slug TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  offer_title TEXT NOT NULL,
  offer_description TEXT,
  requirements TEXT,
  valid_until TEXT,
  promo_type TEXT DEFAULT 'promotion',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_provider_promotions_slug ON provider_promotions(provider_slug);
CREATE INDEX IF NOT EXISTS idx_provider_promotions_active ON provider_promotions(is_active);

-- Enable RLS but allow public read access
ALTER TABLE provider_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_promotions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on provider_plans" ON provider_plans
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on provider_promotions" ON provider_promotions
  FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access on provider_plans" ON provider_plans
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on provider_promotions" ON provider_promotions
  FOR ALL USING (auth.role() = 'service_role');
