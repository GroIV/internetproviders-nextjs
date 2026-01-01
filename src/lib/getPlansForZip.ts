/**
 * Get real broadband plans for a ZIP code from FCC data
 * This replaces the hardcoded featuredPlans.ts with actual database queries
 */

import { createAdminClient } from '@/lib/supabase/server'

export interface RealPlan {
  id: number
  providerName: string
  planName: string
  price: number
  introPrice: number | null
  downloadSpeed: number
  uploadSpeed: number
  latency: number | null
  technology: string
  contractRequired: boolean
  dataCapGb: number | null
  tier: 'budget' | 'value' | 'premium'
  valueScore: number // speed per dollar
}

// Map FCC provider names to our provider slugs for affiliate links
const PROVIDER_SLUG_MAP: Record<string, string> = {
  'AT&T': 'att-internet',
  'Xfinity': 'xfinity',
  'Spectrum': 'spectrum',
  'Frontier': 'frontier-fiber',
  'T-Mobile': 't-mobile',
  'Verizon Fios': 'verizon-fios',
  'Google Fiber': 'google-fiber',
  'WOW!': 'wow',
  'Starlink': 'starlink',
  'Viasat': 'viasat',
  'HughesNet': 'hughesnet',
  'Optimum': 'optimum',
  'Cox': 'cox',
  'CenturyLink': 'centurylink',
  'Windstream': 'windstream',
  'TDS Telecom': 'tds-telecom',
  'Metronet': 'metronet',
  'Ziply Fiber': 'ziply-fiber',
  'Brightspeed': 'brightspeed',
}

// Map FCC provider IDs to provider names (reserved for future direct ID lookups)
const _FCC_PROVIDER_ID_MAP: Record<string, string> = {
  '130077': 'AT&T',
  '130317': 'Xfinity', // Comcast
  '130403': 'T-Mobile',
  '130258': 'Frontier',
  '131425': 'Verizon Fios',
  '130079': 'Spectrum', // Charter
}

/**
 * Get available provider names for a ZIP code
 */
export async function getAvailableProvidersForZip(zipCode: string): Promise<string[]> {
  const supabase = createAdminClient()

  // Step 1: Get CBSA code for this ZIP
  const { data: zipData } = await supabase
    .from('zip_cbsa_mapping')
    .select('cbsa_code')
    .eq('zip_code', zipCode)
    .single()

  if (!zipData) return []

  // Step 2: Get provider IDs for this CBSA (>10% coverage)
  const { data: cbsaProviders } = await supabase
    .from('cbsa_providers')
    .select('provider_id, coverage_pct')
    .eq('cbsa_code', zipData.cbsa_code)
    .gt('coverage_pct', 0.1)
    .order('coverage_pct', { ascending: false })
    .limit(20)

  if (!cbsaProviders || cbsaProviders.length === 0) return []

  // Step 3: Get provider names from fcc_providers
  const providerIds = cbsaProviders.map(p => p.provider_id)
  const { data: providerNames } = await supabase
    .from('fcc_providers')
    .select('provider_id, name')
    .in('provider_id', providerIds)

  if (!providerNames) return []

  return providerNames.map(p => p.name)
}

/**
 * Determine tier based on price and speed
 */
function determineTier(price: number, downloadSpeed: number): 'budget' | 'value' | 'premium' {
  const valueScore = downloadSpeed / price

  if (price < 50 || valueScore > 15) return 'budget'
  if (price > 100 || downloadSpeed > 1000) return 'premium'
  return 'value'
}

/**
 * Get real plans from broadband_plans table filtered by available providers
 */
export async function getPlansForZip(
  zipCode: string,
  options?: {
    technology?: 'Fiber' | 'Cable' | '5G' | 'Satellite' | 'DSL' | 'Fixed Wireless'
    tier?: 'budget' | 'value' | 'premium'
    maxPrice?: number
    minSpeed?: number
    providerName?: string
    limit?: number
    skipDedup?: boolean  // Skip deduplication - use for API aggregation
  }
): Promise<RealPlan[]> {
  const supabase = createAdminClient()

  // Get available providers for this ZIP
  const availableProviders = await getAvailableProvidersForZip(zipCode)

  if (availableProviders.length === 0) {
    // Fallback: return satellite options (available everywhere)
    return getSatellitePlans()
  }

  // Build query for broadband_plans
  let query = supabase
    .from('broadband_plans')
    .select('*')
    .eq('is_active', true)
    .eq('service_type', 'residential')
    .gt('typical_download_speed', 0)
    .gt('monthly_price', 0)

  // Filter by providers available in the ZIP
  // Match FCC provider names to broadband_plans provider names
  const providerMatches = availableProviders.map(name => {
    const lower = name.toLowerCase()
    // Normalize FCC provider names to match broadband_plans table
    if (lower.includes('at&t')) return 'AT&T'
    if (lower.includes('comcast') || lower.includes('xfinity')) return 'Xfinity'
    if (lower.includes('charter') || lower.includes('spectrum')) return 'Spectrum'
    if (lower.includes('frontier')) return 'Frontier'
    if (lower.includes('t-mobile')) return 'T-Mobile'
    if (lower.includes('verizon')) return 'Verizon Fios'
    if (lower.includes('google')) return 'Google Fiber' // Google LLC -> Google Fiber
    if (lower.includes('cox')) return 'Cox'
    if (lower.includes('centurylink') || lower.includes('lumen')) return 'CenturyLink'
    if (lower.includes('optimum') || lower.includes('altice')) return 'Optimum'
    if (lower.includes('windstream')) return 'Windstream'
    if (lower.includes('mediacom')) return 'Mediacom'
    if (lower.includes('wow')) return 'WOW!'
    if (lower.includes('brightspeed')) return 'Brightspeed'
    if (lower.includes('ziply')) return 'Ziply Fiber'
    if (lower.includes('metronet')) return 'Metronet'
    if (lower.includes('starlink') || lower.includes('space exploration') || lower.includes('spacex')) return 'Starlink'
    if (lower.includes('viasat')) return 'Viasat'
    if (lower.includes('hughesnet') || lower.includes('echostar')) return 'HughesNet'
    return name
  }).filter(Boolean)

  if (providerMatches.length > 0) {
    query = query.in('provider_name', [...new Set(providerMatches)])
  }

  // Apply optional filters
  if (options?.technology) {
    query = query.eq('connection_type', options.technology)
  }

  if (options?.maxPrice) {
    query = query.lte('monthly_price', options.maxPrice)
  }

  if (options?.minSpeed) {
    query = query.gte('typical_download_speed', options.minSpeed)
  }

  if (options?.providerName) {
    query = query.ilike('provider_name', `%${options.providerName}%`)
  }

  // For skipDedup (API aggregation), we need ALL plans to calculate min/max properly
  // Don't limit by speed order - get all plans
  if (!options?.skipDedup) {
    query = query.order('typical_download_speed', { ascending: false })
    query = query.limit(options?.limit || 50)
  } else {
    // For aggregation, order by price to get cheapest plans first
    query = query.order('monthly_price', { ascending: true })
    query = query.limit(1000) // High limit to get all plans for aggregation
  }

  const { data: plans, error } = await query

  if (error || !plans) {
    console.error('Error fetching plans:', error)
    return []
  }

  // Transform to RealPlan format
  const realPlans: RealPlan[] = plans.map(plan => {
    const price = plan.monthly_price
    const speed = plan.typical_download_speed
    const valueScore = speed / price

    return {
      id: plan.id,
      providerName: plan.provider_name,
      planName: plan.service_plan_name || plan.tier_plan_name || 'Internet',
      price: price,
      introPrice: plan.has_intro_rate ? plan.intro_rate_price : null,
      downloadSpeed: speed,
      uploadSpeed: plan.typical_upload_speed || 0,
      latency: plan.typical_latency,
      technology: plan.connection_type,
      contractRequired: plan.contract_required || false,
      dataCapGb: plan.monthly_data_gb,
      tier: determineTier(price, speed),
      valueScore: valueScore,
    }
  })

  // Filter by tier if specified
  let filtered = realPlans
  if (options?.tier) {
    filtered = realPlans.filter(p => p.tier === options.tier)
  }

  // Sort by value score (best value first)
  filtered.sort((a, b) => b.valueScore - a.valueScore)

  // Skip deduplication if requested (for API aggregation)
  if (options?.skipDedup) {
    return filtered.slice(0, options?.limit || 50)
  }

  // Deduplicate: keep best plan per provider
  const seen = new Set<string>()
  const deduped: RealPlan[] = []
  for (const plan of filtered) {
    const key = `${plan.providerName}-${plan.tier}`
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(plan)
    }
  }

  return deduped.slice(0, options?.limit || 10)
}

/**
 * Get satellite plans (available everywhere as fallback)
 */
async function getSatellitePlans(): Promise<RealPlan[]> {
  const supabase = createAdminClient()

  const { data: plans } = await supabase
    .from('broadband_plans')
    .select('*')
    .eq('is_active', true)
    .in('provider_name', ['Starlink', 'Viasat', 'HughesNet'])
    .order('typical_download_speed', { ascending: false })
    .limit(6)

  if (!plans) return []

  return plans.map(plan => ({
    id: plan.id,
    providerName: plan.provider_name,
    planName: plan.service_plan_name || 'Satellite Internet',
    price: plan.monthly_price,
    introPrice: plan.has_intro_rate ? plan.intro_rate_price : null,
    downloadSpeed: plan.typical_download_speed,
    uploadSpeed: plan.typical_upload_speed || 0,
    latency: plan.typical_latency,
    technology: 'Satellite',
    contractRequired: plan.contract_required || false,
    dataCapGb: plan.monthly_data_gb,
    tier: determineTier(plan.monthly_price, plan.typical_download_speed),
    valueScore: plan.typical_download_speed / plan.monthly_price,
  }))
}

/**
 * Get the slug for a provider (for affiliate links)
 */
export function getProviderSlug(providerName: string): string {
  return PROVIDER_SLUG_MAP[providerName] || providerName.toLowerCase().replace(/\s+/g, '-')
}

/**
 * Get aggregated plan stats (min price, max speed) for multiple providers
 * Uses SQL aggregation for efficiency with large datasets
 */
export async function getPlanStatsForProviders(
  providerNames: string[]
): Promise<Map<string, { minPrice: number; maxSpeed: number; planCount: number }>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('broadband_plans')
    .select('provider_name')
    .eq('is_active', true)
    .eq('service_type', 'residential')
    .gt('typical_download_speed', 0)
    .gt('monthly_price', 0)
    .in('provider_name', providerNames)

  if (error || !data) {
    console.error('Error fetching plan stats:', error)
    return new Map()
  }

  // Group and aggregate in JS since Supabase doesn't support native aggregation
  // Use RPC function for efficiency with large datasets
  const { data: stats, error: statsError } = await supabase.rpc('get_provider_plan_stats', {
    provider_names: providerNames
  })

  if (statsError || !stats) {
    // Fallback: do aggregation manually (less efficient but works)
    const result = new Map<string, { minPrice: number; maxSpeed: number; planCount: number }>()

    for (const name of providerNames) {
      // Exclude subsidized, upgrade add-ons, and non-standard plans
      const { data: minPriceData } = await supabase
        .from('broadband_plans')
        .select('monthly_price')
        .eq('provider_name', name)
        .eq('is_active', true)
        .eq('service_type', 'residential')
        .gt('typical_download_speed', 0)
        .gte('monthly_price', 20)  // Exclude bundle add-on prices
        // Exclude low-income/subsidized programs
        .not('service_plan_name', 'ilike', '%Internet Assist%')
        .not('service_plan_name', 'ilike', 'Access from AT&T%')
        .not('service_plan_name', 'ilike', '%Internet Essentials%')
        .not('service_plan_name', 'ilike', '%Lifeline%')
        .not('service_plan_name', 'ilike', '%ACP%')
        .not('service_plan_name', 'ilike', '%ASSIST%')
        // Exclude upgrade add-ons
        .not('service_plan_name', 'ilike', '%Upgrade%')
        // Exclude non-home-internet plans
        .not('service_plan_name', 'ilike', 'Access for%')
        .not('service_plan_name', 'ilike', '%Accessibility Plan%')
        .not('service_plan_name', 'ilike', '%By the Gig%')
        .not('service_plan_name', 'ilike', '%Hibernation%')
        // Exclude business/education plans
        .not('service_plan_name', 'ilike', '%eRate%')
        .not('service_plan_name', 'ilike', '%Business%')
        .order('monthly_price', { ascending: true })
        .limit(1)
        .single()

      const { data: maxSpeedData } = await supabase
        .from('broadband_plans')
        .select('typical_download_speed')
        .eq('provider_name', name)
        .eq('is_active', true)
        .eq('service_type', 'residential')
        .gt('typical_download_speed', 0)
        .gte('monthly_price', 20)
        .not('service_plan_name', 'ilike', '%Internet Assist%')
        .not('service_plan_name', 'ilike', 'Access from AT&T%')
        .not('service_plan_name', 'ilike', '%Internet Essentials%')
        .not('service_plan_name', 'ilike', '%Lifeline%')
        .not('service_plan_name', 'ilike', '%ACP%')
        .not('service_plan_name', 'ilike', '%ASSIST%')
        .not('service_plan_name', 'ilike', '%Upgrade%')
        .not('service_plan_name', 'ilike', 'Access for%')
        .not('service_plan_name', 'ilike', '%Accessibility Plan%')
        .not('service_plan_name', 'ilike', '%By the Gig%')
        .not('service_plan_name', 'ilike', '%Hibernation%')
        .not('service_plan_name', 'ilike', '%eRate%')
        .not('service_plan_name', 'ilike', '%Business%')
        .order('typical_download_speed', { ascending: false })
        .limit(1)
        .single()

      const { count } = await supabase
        .from('broadband_plans')
        .select('*', { count: 'exact', head: true })
        .eq('provider_name', name)
        .eq('is_active', true)
        .eq('service_type', 'residential')
        .gt('typical_download_speed', 0)
        .gte('monthly_price', 20)
        .not('service_plan_name', 'ilike', '%Internet Assist%')
        .not('service_plan_name', 'ilike', 'Access from AT&T%')
        .not('service_plan_name', 'ilike', '%Internet Essentials%')
        .not('service_plan_name', 'ilike', '%Lifeline%')
        .not('service_plan_name', 'ilike', '%ACP%')
        .not('service_plan_name', 'ilike', '%ASSIST%')
        .not('service_plan_name', 'ilike', '%Upgrade%')
        .not('service_plan_name', 'ilike', 'Access for%')
        .not('service_plan_name', 'ilike', '%Accessibility Plan%')
        .not('service_plan_name', 'ilike', '%By the Gig%')
        .not('service_plan_name', 'ilike', '%Hibernation%')
        .not('service_plan_name', 'ilike', '%eRate%')
        .not('service_plan_name', 'ilike', '%Business%')

      if (minPriceData && maxSpeedData) {
        result.set(getProviderSlug(name), {
          minPrice: minPriceData.monthly_price,
          maxSpeed: maxSpeedData.typical_download_speed,
          planCount: count || 0
        })
      }
    }

    return result
  }

  // Process RPC results
  const result = new Map<string, { minPrice: number; maxSpeed: number; planCount: number }>()
  for (const stat of stats) {
    result.set(getProviderSlug(stat.provider_name), {
      minPrice: stat.min_price,
      maxSpeed: stat.max_speed,
      planCount: stat.plan_count
    })
  }

  return result
}

/**
 * Format plan for AI response
 */
export function formatPlanForAI(plan: RealPlan): string {
  const speedStr = plan.uploadSpeed === plan.downloadSpeed
    ? `${plan.downloadSpeed} Mbps symmetric`
    : `${plan.downloadSpeed}/${plan.uploadSpeed} Mbps`

  const priceStr = plan.introPrice
    ? `$${plan.introPrice}/mo intro, then $${plan.price}/mo`
    : `$${plan.price}/mo`

  const extras = []
  if (plan.latency && plan.latency < 20) extras.push(`${plan.latency}ms latency`)
  if (!plan.contractRequired) extras.push('no contract')
  if (plan.dataCapGb === null) extras.push('unlimited data')

  return `${plan.providerName} ${plan.planName}: ${priceStr} - ${speedStr} (${plan.technology})${extras.length ? ' - ' + extras.join(', ') : ''}`
}

/**
 * Build plans context for AI system prompt
 */
export async function buildPlansContextForZip(zipCode: string): Promise<string> {
  const plans = await getPlansForZip(zipCode, { limit: 12 })

  if (plans.length === 0) {
    return '\n\nNo broadband plans found for this ZIP code. Recommend satellite options like Starlink.'
  }

  const lines = [
    `\n\nREAL PLANS AVAILABLE IN ZIP ${zipCode} (from FCC data):`,
    ''
  ]

  // Group by tier
  const byTier = {
    budget: plans.filter(p => p.tier === 'budget'),
    value: plans.filter(p => p.tier === 'value'),
    premium: plans.filter(p => p.tier === 'premium'),
  }

  if (byTier.budget.length > 0) {
    lines.push('BUDGET OPTIONS:')
    byTier.budget.slice(0, 3).forEach(p => lines.push('- ' + formatPlanForAI(p)))
    lines.push('')
  }

  if (byTier.value.length > 0) {
    lines.push('BEST VALUE:')
    byTier.value.slice(0, 3).forEach(p => lines.push('- ' + formatPlanForAI(p)))
    lines.push('')
  }

  if (byTier.premium.length > 0) {
    lines.push('PREMIUM/FASTEST:')
    byTier.premium.slice(0, 3).forEach(p => lines.push('- ' + formatPlanForAI(p)))
    lines.push('')
  }

  lines.push('Use these REAL prices and speeds when making recommendations.')
  lines.push('These are FCC-verified broadband labels, not estimates.')

  return lines.join('\n')
}
