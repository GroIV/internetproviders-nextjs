/**
 * Create TV Plans table and insert DIRECTV and DISH data
 * Run with: npx tsx scripts/create-tv-plans-table.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

interface TVPlan {
  plan_id: string
  provider_name: string
  package_name: string
  base_price: number
  gemini_fee: number
  rsn_fee_max: number
  total_min: number
  total_max: number
  channel_count: number | null
  channel_count_text: string
  contract_months: number
  activation_fee: number
  early_termination_fee: string
  premium_channels: string[]
  features: string[]
  notes: string | null
  service_type: string
  is_active: boolean
  data_source: string
}

// DIRECTV packages from user data
const directvPlans: TVPlan[] = [
  {
    plan_id: 'DIRECTV-ENTERTAINMENT',
    provider_name: 'DIRECTV',
    package_name: 'ENTERTAINMENT',
    base_price: 89.99,
    gemini_fee: 10.00,
    rsn_fee_max: 0.00,
    total_min: 99.99,
    total_max: 99.99,
    channel_count: 175,
    channel_count_text: '175+',
    contract_months: 24,
    activation_fee: 49.95,
    early_termination_fee: '$20/mo remaining',
    premium_channels: ['ESPN Unlimited'],
    features: ['No Regional Sports Fee'],
    notes: 'Save $12/mo by removing local channels',
    service_type: 'satellite',
    is_active: true,
    data_source: 'manual_entry'
  },
  {
    plan_id: 'DIRECTV-CHOICE',
    provider_name: 'DIRECTV',
    package_name: 'CHOICE',
    base_price: 94.99,
    gemini_fee: 10.00,
    rsn_fee_max: 19.99,
    total_min: 104.99,
    total_max: 124.98,
    channel_count: 215,
    channel_count_text: '215+',
    contract_months: 24,
    activation_fee: 49.95,
    early_termination_fee: '$20/mo remaining',
    premium_channels: ['ESPN Unlimited'],
    features: ['Big Ten Network', 'MLB Network', 'NBA TV', 'NFL Network'],
    notes: 'Most popular; includes sports networks',
    service_type: 'satellite',
    is_active: true,
    data_source: 'manual_entry'
  },
  {
    plan_id: 'DIRECTV-ULTIMATE',
    provider_name: 'DIRECTV',
    package_name: 'ULTIMATE',
    base_price: 124.99,
    gemini_fee: 10.00,
    rsn_fee_max: 19.99,
    total_min: 134.99,
    total_max: 154.98,
    channel_count: 280,
    channel_count_text: '280+',
    contract_months: 24,
    activation_fee: 49.95,
    early_termination_fee: '$20/mo remaining',
    premium_channels: ['ESPN Unlimited'],
    features: ['More movie channels', 'Sports networks'],
    notes: 'Best for families; includes more movie channels',
    service_type: 'satellite',
    is_active: true,
    data_source: 'manual_entry'
  },
  {
    plan_id: 'DIRECTV-PREMIER',
    provider_name: 'DIRECTV',
    package_name: 'PREMIER',
    base_price: 169.99,
    gemini_fee: 10.00,
    rsn_fee_max: 19.99,
    total_min: 179.99,
    total_max: 199.98,
    channel_count: 350,
    channel_count_text: '350+',
    contract_months: 24,
    activation_fee: 49.95,
    early_termination_fee: '$20/mo remaining',
    premium_channels: ['ESPN Unlimited', 'Max (HBO)', 'STARZ', 'Paramount+ w/SHOWTIME', 'Cinemax'],
    features: ['All premium networks', 'NFL RedZone'],
    notes: 'All premium networks included; NFL RedZone included',
    service_type: 'satellite',
    is_active: true,
    data_source: 'manual_entry'
  }
]

// DISH Network packages from user data
const dishPlans: TVPlan[] = [
  {
    plan_id: 'DISH-TOP-120',
    provider_name: 'DISH Network',
    package_name: "America's Top 120",
    base_price: 89.99,
    gemini_fee: 0,
    rsn_fee_max: 0,
    total_min: 89.99,
    total_max: 89.99,
    channel_count: 190,
    channel_count_text: '190',
    contract_months: 24,
    activation_fee: 0,
    early_termination_fee: 'Varies by months remaining',
    premium_channels: [],
    features: ['2-Year Price Guarantee', 'Local Channels', '28000+ On Demand titles', 'Free Standard Installation', 'Hopper 3 DVR Included', '1 TV Included'],
    notes: 'Price increases to $102.99/mo after 2 years',
    service_type: 'satellite',
    is_active: true,
    data_source: 'manual_entry'
  },
  {
    plan_id: 'DISH-TOP-120-PLUS',
    provider_name: 'DISH Network',
    package_name: "America's Top 120+",
    base_price: 99.99,
    gemini_fee: 0,
    rsn_fee_max: 0,
    total_min: 99.99,
    total_max: 99.99,
    channel_count: 190,
    channel_count_text: '190+',
    contract_months: 24,
    activation_fee: 0,
    early_termination_fee: 'Varies by months remaining',
    premium_channels: [],
    features: ['2-Year Price Guarantee', 'Local Channels', '28000+ On Demand titles', 'Free Standard Installation', 'Hopper 3 DVR Included', '2 TVs Included'],
    notes: 'Price increases to $107.99/mo after 2 years',
    service_type: 'satellite',
    is_active: true,
    data_source: 'manual_entry'
  },
  {
    plan_id: 'DISH-TOP-200',
    provider_name: 'DISH Network',
    package_name: "America's Top 200",
    base_price: 109.99,
    gemini_fee: 0,
    rsn_fee_max: 0,
    total_min: 109.99,
    total_max: 109.99,
    channel_count: 240,
    channel_count_text: '240+',
    contract_months: 24,
    activation_fee: 0,
    early_termination_fee: 'Varies by months remaining',
    premium_channels: [],
    features: ['2-Year Price Guarantee', 'Local Channels', '28000+ On Demand titles', 'Free Standard Installation', 'Hopper 3 DVR Included', '3 TVs Included'],
    notes: 'Price increases to $117.99/mo after 2 years',
    service_type: 'satellite',
    is_active: true,
    data_source: 'manual_entry'
  },
  {
    plan_id: 'DISH-TOP-250',
    provider_name: 'DISH Network',
    package_name: "America's Top 250",
    base_price: 119.99,
    gemini_fee: 0,
    rsn_fee_max: 0,
    total_min: 119.99,
    total_max: 119.99,
    channel_count: 290,
    channel_count_text: '290+',
    contract_months: 24,
    activation_fee: 0,
    early_termination_fee: 'Varies by months remaining',
    premium_channels: [],
    features: ['2-Year Price Guarantee', 'Local Channels', '28000+ On Demand titles', 'Free Standard Installation', 'Hopper 3 DVR Included', '4 TVs Included'],
    notes: 'Price increases to $127.99/mo after 2 years',
    service_type: 'satellite',
    is_active: true,
    data_source: 'manual_entry'
  },
  {
    plan_id: 'DISH-LATINO-PLUS',
    provider_name: 'DISH Network',
    package_name: 'DishLATINO Plus',
    base_price: 83.99,
    gemini_fee: 0,
    rsn_fee_max: 0,
    total_min: 83.99,
    total_max: 93.99,
    channel_count: 190,
    channel_count_text: '190',
    contract_months: 24,
    activation_fee: 0,
    early_termination_fee: 'Varies by months remaining',
    premium_channels: [],
    features: ['2-Year Price Guarantee', 'HD Free for Life', 'DISH Protect 6 mo free', '3 mo premium trial', '1 TV Included'],
    notes: 'Add Hopper 3 DVR for $10/mo extra',
    service_type: 'satellite',
    is_active: true,
    data_source: 'manual_entry'
  },
  {
    plan_id: 'DISH-LATINO-DOS',
    provider_name: 'DISH Network',
    package_name: 'DishLATINO Dos',
    base_price: 108.99,
    gemini_fee: 0,
    rsn_fee_max: 0,
    total_min: 108.99,
    total_max: 118.99,
    channel_count: 225,
    channel_count_text: '225',
    contract_months: 24,
    activation_fee: 0,
    early_termination_fee: 'Varies by months remaining',
    premium_channels: [],
    features: ['2-Year Price Guarantee', 'HD Free for Life', 'DISH Protect 6 mo free', '3 mo premium trial', '1 TV Included'],
    notes: 'Add Hopper 3 DVR for $10/mo extra',
    service_type: 'satellite',
    is_active: true,
    data_source: 'manual_entry'
  },
  {
    plan_id: 'DISH-LATINO-MAX',
    provider_name: 'DISH Network',
    package_name: 'DishLATINO Max',
    base_price: 123.99,
    gemini_fee: 0,
    rsn_fee_max: 0,
    total_min: 123.99,
    total_max: 133.99,
    channel_count: 270,
    channel_count_text: '270',
    contract_months: 24,
    activation_fee: 0,
    early_termination_fee: 'Varies by months remaining',
    premium_channels: [],
    features: ['2-Year Price Guarantee', 'HD Free for Life', 'DISH Protect 6 mo free', '3 mo premium trial', '1 TV Included'],
    notes: 'Add Hopper 3 DVR for $10/mo extra',
    service_type: 'satellite',
    is_active: true,
    data_source: 'manual_entry'
  }
]

async function main() {
  console.log('📺 Inserting TV Plans...\n')

  // Combine all plans
  const allPlans = [...directvPlans, ...dishPlans]

  // Try to insert the data - if table doesn't exist, we'll get an error
  const { data, error } = await supabase
    .from('tv_plans')
    .upsert(allPlans, { onConflict: 'plan_id' })
    .select()

  if (error) {
    if (error.message.includes('does not exist') || error.message.includes('Could not find')) {
      console.log('❌ Table "tv_plans" does not exist.')
      console.log('\n📋 Please run the following SQL in the Supabase Dashboard SQL Editor:')
      console.log('   https://supabase.com/dashboard/project/aogfhlompvfztymxrxfm/sql/new\n')
      console.log('─'.repeat(60))
      console.log(`
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

CREATE INDEX IF NOT EXISTS idx_tv_plans_provider ON tv_plans(provider_name);
CREATE INDEX IF NOT EXISTS idx_tv_plans_price ON tv_plans(total_min);

ALTER TABLE tv_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on tv_plans" ON tv_plans
    FOR SELECT USING (true);
`)
      console.log('─'.repeat(60))
      console.log('\nAfter creating the table, run this script again.')
      return
    }
    console.log('❌ Error:', error.message)
    return
  }

  console.log(`✅ Inserted ${directvPlans.length} DIRECTV packages:`)
  for (const plan of directvPlans) {
    console.log(`   - ${plan.package_name}: $${plan.total_min}/mo - $${plan.total_max}/mo (${plan.channel_count_text} channels)`)
  }

  console.log(`\n✅ Inserted ${dishPlans.length} DISH packages:`)
  for (const plan of dishPlans) {
    console.log(`   - ${plan.package_name}: $${plan.total_min}/mo (${plan.channel_count_text} channels)`)
  }

  // Show summary
  const { count } = await supabase
    .from('tv_plans')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📊 Total TV plans in database: ${count}`)
}

main().catch(console.error)
