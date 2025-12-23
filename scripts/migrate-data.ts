/**
 * Migration script to import data from old project to Supabase
 * Run with: npx tsx scripts/migrate-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

const OLD_PROJECT_PATH = '/Users/groiv/Python Sandbox/Internet Provders AI 1/GEORGE-CLEANUP-IPAI'

interface ProviderData {
  basic_info: {
    name: string
    slug: string
    category: string
    parent_company?: string
    service_types?: string[]
  }
  research_data?: {
    pricing?: Record<string, string>
    customer_sentiment?: {
      overall_rating?: string
    }
  }
  seo_strategy?: {
    primary_keywords?: Array<{ term: string; volume: number }>
  }
}

interface ZipProviderData {
  [zipCode: string]: {
    state: string
    providers: string[]
  }
}

interface ZipCityData {
  [zipCode: string]: {
    city: string
    state: string
  }
}

async function importProviders() {
  console.log('\\n📦 Importing providers...')

  const masterDbPath = resolve(OLD_PROJECT_PATH, 'server/data/master-provider-database.json')
  const masterDb = JSON.parse(readFileSync(masterDbPath, 'utf-8'))

  const providers = Object.entries(masterDb.providers as Record<string, ProviderData>).map(([slug, data]) => ({
    name: data.basic_info.name,
    slug: data.basic_info.slug || slug,
    category: data.basic_info.category || 'Internet',
    technologies: data.basic_info.service_types || [],
    website: null,
    logo: null,
    support_phone: null,
    support_email: null,
  }))

  console.log(`Found ${providers.length} providers`)

  // Clear existing providers
  await supabase.from('providers').delete().neq('id', 0)

  // Insert providers in batches
  const batchSize = 20
  for (let i = 0; i < providers.length; i += batchSize) {
    const batch = providers.slice(i, i + batchSize)
    const { error } = await supabase.from('providers').insert(batch)
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message)
    } else {
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(providers.length / batchSize)}`)
    }
  }

  // Get the inserted providers to get their IDs
  const { data: insertedProviders } = await supabase
    .from('providers')
    .select('id, name, slug')

  console.log(`✅ Imported ${insertedProviders?.length || 0} providers`)

  return insertedProviders || []
}

async function importCoverage(providers: Array<{ id: number; name: string; slug: string }>) {
  console.log('\\n📦 Importing ZIP coverage data...')

  const zipDbPath = resolve(OLD_PROJECT_PATH, 'server/data/zipProviderDatabase.json')
  const zipCityPath = resolve(OLD_PROJECT_PATH, 'server/data/zipCityMap.json')

  const zipDb: ZipProviderData = JSON.parse(readFileSync(zipDbPath, 'utf-8'))

  let zipCityMap: ZipCityData = {}
  try {
    zipCityMap = JSON.parse(readFileSync(zipCityPath, 'utf-8'))
  } catch (e) {
    console.log('No zipCityMap found, continuing without city data')
  }

  // Create provider name to ID mapping
  const providerMap = new Map<string, number>()
  providers.forEach(p => {
    providerMap.set(p.name.toLowerCase(), p.id)
    providerMap.set(p.slug.toLowerCase(), p.id)
  })

  // Also add common variations
  const nameVariations: Record<string, string[]> = {
    'xfinity': ['comcast', 'xfinity'],
    'spectrum': ['spectrum', 'charter'],
    'verizon': ['verizon', 'verizon fios', 'fios'],
    'att-internet': ['at&t', 'att', 'at&t internet'],
    'tmobile': ['t-mobile', 'tmobile', 't mobile'],
    'frontier': ['frontier', 'frontier communications'],
    'cox': ['cox', 'cox communications'],
    'optimum': ['optimum', 'altice'],
    'hughesnet': ['hughesnet', 'hughes net'],
    'viasat': ['viasat', 'exede'],
    'centurylink': ['centurylink', 'century link', 'lumen'],
    'windstream': ['windstream', 'kinetic'],
    'earthlink': ['earthlink', 'earth link'],
    'mediacom': ['mediacom'],
    'astound': ['astound', 'rcn', 'grande'],
    'breezeline': ['breezeline', 'atlantic broadband'],
  }

  // Build reverse lookup
  Object.entries(nameVariations).forEach(([slug, names]) => {
    const provider = providers.find(p => p.slug === slug)
    if (provider) {
      names.forEach(name => providerMap.set(name.toLowerCase(), provider.id))
    }
  })

  // Process ZIP data
  const coverageRecords: Array<{
    provider_id: number
    zip_code: string
    has_service: boolean
    technology: string | null
  }> = []

  let unmatchedProviders = new Set<string>()

  Object.entries(zipDb).forEach(([zipCode, data]) => {
    data.providers.forEach(providerName => {
      const providerId = providerMap.get(providerName.toLowerCase())
      if (providerId) {
        coverageRecords.push({
          provider_id: providerId,
          zip_code: zipCode,
          has_service: true,
          technology: null,
        })
      } else {
        unmatchedProviders.add(providerName)
      }
    })
  })

  console.log(`Total coverage records to insert: ${coverageRecords.length}`)
  console.log(`Unique ZIPs: ${Object.keys(zipDb).length}`)

  if (unmatchedProviders.size > 0) {
    console.log(`\\n⚠️  Unmatched provider names (${unmatchedProviders.size}):`)
    Array.from(unmatchedProviders).slice(0, 10).forEach(p => console.log(`  - ${p}`))
  }

  // Clear existing coverage
  console.log('\\nClearing existing coverage data...')
  await supabase.from('coverage').delete().neq('id', 0)

  // Insert in large batches (Supabase can handle ~1000 at a time)
  const batchSize = 500
  let inserted = 0

  for (let i = 0; i < coverageRecords.length; i += batchSize) {
    const batch = coverageRecords.slice(i, i + batchSize)
    const { error } = await supabase.from('coverage').insert(batch)
    if (error) {
      console.error(`Error at batch ${i / batchSize + 1}:`, error.message)
    } else {
      inserted += batch.length
      process.stdout.write(`\rInserted ${inserted}/${coverageRecords.length} coverage records (${Math.round(inserted / coverageRecords.length * 100)}%)`)
    }
  }

  console.log(`\\n✅ Imported ${inserted} coverage records`)
}

async function main() {
  console.log('🚀 Starting data migration...')

  try {
    const providers = await importProviders()
    await importCoverage(providers)

    console.log('\\n✅ Migration complete!')

    // Summary
    const { count: providerCount } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })

    const { count: coverageCount } = await supabase
      .from('coverage')
      .select('*', { count: 'exact', head: true })

    console.log('\\n📊 Summary:')
    console.log(`  - Providers: ${providerCount}`)
    console.log(`  - Coverage records: ${coverageCount}`)

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
