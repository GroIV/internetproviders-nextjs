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
  // Match provider names (case-insensitive partial match)
  const providerMatches = availableProviders.map(name => {
    // Normalize provider names for matching
    if (name.toLowerCase().includes('at&t')) return 'AT&T'
    if (name.toLowerCase().includes('comcast') || name.toLowerCase().includes('xfinity')) return 'Xfinity'
    if (name.toLowerCase().includes('charter') || name.toLowerCase().includes('spectrum')) return 'Spectrum'
    if (name.toLowerCase().includes('frontier')) return 'Frontier'
    if (name.toLowerCase().includes('t-mobile')) return 'T-Mobile'
    if (name.toLowerCase().includes('verizon')) return 'Verizon Fios'
    if (name.toLowerCase().includes('google fiber')) return 'Google Fiber'
    if (name.toLowerCase().includes('wow')) return 'WOW!'
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

  // Order by value (speed per dollar)
  query = query.order('typical_download_speed', { ascending: false })
  query = query.limit(options?.limit || 50)

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
