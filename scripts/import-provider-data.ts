/**
 * Import provider plans and promotions from master-provider-database.json
 * Run with: npx tsx scripts/import-provider-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

const MASTER_DB_PATH = resolve(__dirname, '../../original-site/server/data/master-provider-database.json')

interface ProviderPlan {
  provider_slug: string
  provider_name: string
  plan_name: string
  speed_down: string
  speed_up: string | null
  price: string
  price_regular: string | null
  technology: string
  data_cap: string | null
  contract_length: string | null
  features: string[]
}

interface ProviderPromotion {
  provider_slug: string
  provider_name: string
  offer_title: string
  offer_description: string
  requirements: string | null
  valid_until: string | null
  promo_type: string
}

function parsePrice(priceStr: string): number | null {
  const match = priceStr.match(/\$?([\d.]+)/)
  return match ? parseFloat(match[1]) : null
}

function parseSpeed(speedStr: string): { down: string; up: string | null } {
  // Handle various formats
  if (speedStr.includes('/')) {
    const [down, up] = speedStr.split('/')
    return { down: down.trim(), up: up.trim() }
  }
  return { down: speedStr, up: null }
}

async function createTables() {
  console.log('\n📦 Creating tables...')

  // Create provider_plans table
  const { error: plansError } = await supabase.rpc('exec_sql', {
    sql: `
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
        features JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_provider_plans_slug ON provider_plans(provider_slug);
      CREATE INDEX IF NOT EXISTS idx_provider_plans_technology ON provider_plans(technology);
    `
  })

  if (plansError) {
    console.log('Note: Plans table may already exist or RPC not available, trying direct insert...')
  }

  // Create provider_promotions table
  const { error: promosError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS provider_promotions (
        id SERIAL PRIMARY KEY,
        provider_slug TEXT NOT NULL,
        provider_name TEXT NOT NULL,
        offer_title TEXT NOT NULL,
        offer_description TEXT,
        requirements TEXT,
        valid_until TEXT,
        promo_type TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_provider_promotions_slug ON provider_promotions(provider_slug);
      CREATE INDEX IF NOT EXISTS idx_provider_promotions_active ON provider_promotions(is_active);
    `
  })

  if (promosError) {
    console.log('Note: Promotions table may already exist or RPC not available')
  }

  console.log('✅ Tables ready')
}

function extractPlansAndPromotions(masterDb: any): { plans: ProviderPlan[]; promotions: ProviderPromotion[] } {
  const plans: ProviderPlan[] = []
  const promotions: ProviderPromotion[] = []

  Object.entries(masterDb.providers).forEach(([slug, provider]: [string, any]) => {
    const name = provider.basic_info?.name || slug
    const researchData = provider.research_data

    if (!researchData) return

    // Extract pricing/plans
    if (researchData.pricing) {
      Object.entries(researchData.pricing).forEach(([planKey, priceStr]: [string, any]) => {
        // Try to parse the plan details
        const technology = provider.basic_info?.service_types?.[0] || 'Internet'

        // Parse plan name from key (e.g., "fiber_300" -> "Fiber 300 Mbps")
        let planName = planKey
          .replace(/_/g, ' ')
          .replace(/(\d+)/g, ' $1')
          .replace(/mbps/gi, 'Mbps')
          .replace(/gig/gi, 'Gig')
          .trim()
        planName = planName.charAt(0).toUpperCase() + planName.slice(1)

        // Extract speed from plan key
        let speedDown = '100 Mbps'
        const speedMatch = planKey.match(/(\d+)/g)
        if (speedMatch) {
          const speedNum = parseInt(speedMatch[0])
          if (speedNum >= 1000 || planKey.toLowerCase().includes('gig')) {
            speedDown = `${speedNum >= 1000 ? speedNum / 1000 : speedNum} Gbps`
          } else {
            speedDown = `${speedNum} Mbps`
          }
        }

        // Parse packages for more detailed info
        const packageInfo = researchData.packages?.[planKey]
        if (packageInfo?.speed) {
          const parsed = parseSpeed(packageInfo.speed)
          speedDown = parsed.down
        }

        plans.push({
          provider_slug: slug,
          provider_name: name,
          plan_name: planName,
          speed_down: speedDown,
          speed_up: packageInfo?.symmetrical ? speedDown : (packageInfo?.upload || null),
          price: priceStr,
          price_regular: null,
          technology,
          data_cap: packageInfo?.data_cap || researchData.terms?.data_cap || null,
          contract_length: researchData.terms?.contracts || null,
          features: []
        })
      })
    }

    // Also look at packages directly
    if (researchData.packages && Object.keys(plans.filter(p => p.provider_slug === slug)).length === 0) {
      Object.entries(researchData.packages).forEach(([planKey, pkg]: [string, any]) => {
        if (typeof pkg === 'object' && pkg.speed) {
          const parsed = parseSpeed(pkg.speed)
          plans.push({
            provider_slug: slug,
            provider_name: name,
            plan_name: planKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            speed_down: parsed.down,
            speed_up: parsed.up || (pkg.symmetrical ? parsed.down : null),
            price: 'Contact for pricing',
            price_regular: null,
            technology: provider.basic_info?.service_types?.[0] || 'Internet',
            data_cap: pkg.data_cap || null,
            contract_length: researchData.terms?.contracts || null,
            features: pkg.features || []
          })
        }
      })
    }

    // Extract promotions
    if (researchData.promotions) {
      Object.entries(researchData.promotions).forEach(([promoKey, promo]: [string, any]) => {
        if (typeof promo === 'object') {
          promotions.push({
            provider_slug: slug,
            provider_name: name,
            offer_title: promo.offer || promo.gift_card || promoKey.replace(/_/g, ' '),
            offer_description: promo.offer || promo.description || '',
            requirements: promo.requirement || promo.requirements || null,
            valid_until: promo.valid_through || promo.ends || null,
            promo_type: promoKey.includes('gift') ? 'gift_card' :
                       promoKey.includes('discount') ? 'discount' : 'promotion'
          })
        } else if (typeof promo === 'string') {
          promotions.push({
            provider_slug: slug,
            provider_name: name,
            offer_title: promo,
            offer_description: promo,
            requirements: null,
            valid_until: null,
            promo_type: 'promotion'
          })
        }
      })
    }
  })

  return { plans, promotions }
}

async function importPlans(plans: ProviderPlan[]) {
  console.log(`\n📦 Importing ${plans.length} plans...`)

  // Clear existing plans
  const { error: deleteError } = await supabase.from('provider_plans').delete().neq('id', 0)
  if (deleteError && !deleteError.message.includes('does not exist')) {
    console.log('Could not clear plans table:', deleteError.message)
  }

  // Transform and insert
  const records = plans.map(plan => {
    const priceMatch = plan.price.match(/\$?([\d.]+)/)
    const pricePromo = priceMatch ? parseFloat(priceMatch[1]) : null

    return {
      provider_slug: plan.provider_slug,
      provider_name: plan.provider_name,
      plan_name: plan.plan_name,
      speed_down: plan.speed_down,
      speed_up: plan.speed_up,
      price_promo: pricePromo,
      price_regular: plan.price_regular ? parseFloat(plan.price_regular.replace(/[^\d.]/g, '')) : null,
      technology: plan.technology,
      data_cap: plan.data_cap,
      contract_length: plan.contract_length,
      features: plan.features
    }
  })

  const batchSize = 50
  let inserted = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    const { error } = await supabase.from('provider_plans').insert(batch)
    if (error) {
      console.error(`Error at batch ${i / batchSize + 1}:`, error.message)
    } else {
      inserted += batch.length
    }
  }

  console.log(`✅ Imported ${inserted} plans`)
}

async function importPromotions(promotions: ProviderPromotion[]) {
  console.log(`\n📦 Importing ${promotions.length} promotions...`)

  // Clear existing promotions
  const { error: deleteError } = await supabase.from('provider_promotions').delete().neq('id', 0)
  if (deleteError && !deleteError.message.includes('does not exist')) {
    console.log('Could not clear promotions table:', deleteError.message)
  }

  // Insert promotions
  const records = promotions.map(promo => ({
    provider_slug: promo.provider_slug,
    provider_name: promo.provider_name,
    offer_title: promo.offer_title,
    offer_description: promo.offer_description,
    requirements: promo.requirements,
    valid_until: promo.valid_until,
    promo_type: promo.promo_type,
    is_active: true
  }))

  const { error } = await supabase.from('provider_promotions').insert(records)
  if (error) {
    console.error('Error inserting promotions:', error.message)
  } else {
    console.log(`✅ Imported ${records.length} promotions`)
  }
}

async function main() {
  console.log('🚀 Starting provider data import...\n')

  try {
    // Read master database
    console.log('📖 Reading master database...')
    const masterDb = JSON.parse(readFileSync(MASTER_DB_PATH, 'utf-8'))
    console.log(`Found ${Object.keys(masterDb.providers).length} providers`)

    // Extract plans and promotions
    const { plans, promotions } = extractPlansAndPromotions(masterDb)
    console.log(`Extracted ${plans.length} plans and ${promotions.length} promotions`)

    // Import data
    await importPlans(plans)
    await importPromotions(promotions)

    // Summary
    console.log('\n📊 Import Summary:')

    const { count: planCount } = await supabase
      .from('provider_plans')
      .select('*', { count: 'exact', head: true })

    const { count: promoCount } = await supabase
      .from('provider_promotions')
      .select('*', { count: 'exact', head: true })

    console.log(`  - Plans: ${planCount}`)
    console.log(`  - Promotions: ${promoCount}`)

    console.log('\n✅ Import complete!')

  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }
}

main()
