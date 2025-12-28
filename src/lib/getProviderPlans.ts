/**
 * Server-side utility for fetching real broadband plans from Supabase
 * Uses the broadband_plans table populated from FCC Broadband Labels
 */

import { createAdminClient } from '@/lib/supabase/server'

export interface RealPlan {
  id: number
  planName: string
  tierName: string | null
  connectionType: string
  serviceType: string
  monthlyPrice: number
  hasIntroRate: boolean
  introPrice: number | null
  introMonths: number | null
  downloadSpeed: number | null
  uploadSpeed: number | null
  latency: number | null
  dataGb: number | null
  isUnlimited: boolean
  contractRequired: boolean
  contractMonths: number | null
  earlyTerminationFee: number | null
  oneTimeFees: string | null
  monthlyFees: string | null
  supportPhone: string | null
  collectedAt: string | null
}

export interface TieredPlans {
  budget: RealPlan | null
  value: RealPlan | null
  premium: RealPlan | null
  allPlans: RealPlan[]
  hasFallback: boolean
  collectedAt: string | null
}

/**
 * Get real plans from broadband_plans for a provider
 * Returns tiered plans (budget/value/premium) based on price distribution
 */
export async function getProviderPlans(providerSlug: string): Promise<TieredPlans> {
  const supabase = createAdminClient()

  // Get provider ID from slug
  const { data: provider } = await supabase
    .from('providers')
    .select('id, name')
    .eq('slug', providerSlug)
    .single()

  if (!provider) {
    return {
      budget: null,
      value: null,
      premium: null,
      allPlans: [],
      hasFallback: true,
      collectedAt: null,
    }
  }

  const basePlansSelect = `
    id,
    service_plan_name,
    tier_plan_name,
    connection_type,
    service_type,
    monthly_price,
    has_intro_rate,
    intro_rate_price,
    intro_rate_months,
    typical_download_speed,
    typical_upload_speed,
    typical_latency,
    monthly_data_gb,
    contract_required,
    contract_months,
    early_termination_fee,
    one_time_fees,
    monthly_fees,
    collected_at
  `

  // Query active residential fixed plans (prefer deterministic provider_id linkage)
  const { data: plansById, error: plansByIdError } = await supabase
    .from('broadband_plans')
    .select(basePlansSelect)
    .eq('provider_id', provider.id)
    .eq('is_active', true)
    .eq('connection_type', 'Fixed')
    .eq('service_type', 'residential')
    .order('monthly_price', { ascending: true })

  let plans = plansById
  let plansError = plansByIdError

  // Fallback: some rows may not have provider_id populated (older imports). Try provider_name match.
  if (!plans || plans.length === 0) {
    const { data: plansByName, error: plansByNameError } = await supabase
      .from('broadband_plans')
      .select(basePlansSelect)
      .ilike('provider_name', `%${provider.name}%`)
      .eq('is_active', true)
      .eq('connection_type', 'Fixed')
      .eq('service_type', 'residential')
      .order('monthly_price', { ascending: true })

    plans = plansByName
    plansError = plansByNameError
  }

  if (plansError || !plans || plans.length === 0) {
    return {
      budget: null,
      value: null,
      premium: null,
      allPlans: [],
      hasFallback: true,
      collectedAt: null,
    }
  }

  // Transform plans - filter out invalid prices ($0 or null/non-numeric)
  const transformedPlans: RealPlan[] = plans
    .filter(p => typeof p.monthly_price === 'number' && p.monthly_price > 0)
    .map(plan => ({
      id: plan.id,
      planName: plan.service_plan_name || 'Internet Plan',
      tierName: plan.tier_plan_name,
      connectionType: plan.connection_type,
      serviceType: plan.service_type,
      monthlyPrice: plan.monthly_price,
      hasIntroRate: plan.has_intro_rate || false,
      introPrice: plan.intro_rate_price,
      introMonths: plan.intro_rate_months,
      downloadSpeed: plan.typical_download_speed,
      uploadSpeed: plan.typical_upload_speed,
      latency: plan.typical_latency,
      dataGb: plan.monthly_data_gb,
      isUnlimited: plan.monthly_data_gb === null,
      contractRequired: plan.contract_required || false,
      contractMonths: plan.contract_months,
      earlyTerminationFee: plan.early_termination_fee,
      oneTimeFees: plan.one_time_fees,
      monthlyFees: plan.monthly_fees,
      supportPhone: null,
      collectedAt: plan.collected_at,
    }))

  if (transformedPlans.length === 0) {
    return {
      budget: null,
      value: null,
      premium: null,
      allPlans: [],
      hasFallback: true,
      collectedAt: null,
    }
  }

  // Get latest collected_at date
  const collectedAt = transformedPlans
    .map(p => p.collectedAt)
    .filter(Boolean)
    .sort()
    .pop() || null

  // Assign tiers based on price tertiles
  const tiered = assignTiers(transformedPlans)

  return {
    ...tiered,
    allPlans: transformedPlans,
    hasFallback: false,
    collectedAt,
  }
}

/**
 * Assign budget/value/premium tiers based on price distribution
 */
function assignTiers(plans: RealPlan[]): Pick<TieredPlans, 'budget' | 'value' | 'premium'> {
  if (plans.length === 0) {
    return { budget: null, value: null, premium: null }
  }

  if (plans.length === 1) {
    return { budget: null, value: plans[0], premium: null }
  }

  if (plans.length === 2) {
    return { budget: plans[0], value: null, premium: plans[1] }
  }

  // For 3+ plans, use tertiles
  const sorted = [...plans].sort((a, b) => a.monthlyPrice - b.monthlyPrice)
  const third = Math.floor(sorted.length / 3)

  // Budget: cheapest plan
  const budget = sorted[0]

  // Value: middle tier - pick best speed/price ratio from middle third
  const middleStart = third
  const middleEnd = Math.min(third * 2, sorted.length - 1)
  const middlePlans = sorted.slice(middleStart, middleEnd + 1)
  const value = middlePlans.reduce((best, plan) => {
    const score = (plan.downloadSpeed || 0) / (plan.monthlyPrice || 1)
    const bestScore = (best.downloadSpeed || 0) / (best.monthlyPrice || 1)
    return score > bestScore ? plan : best
  }, middlePlans[0])

  // Premium: fastest plan (or most expensive if speeds equal), excluding already-picked budget/value when possible
  const excluded = new Set<number>([budget.id, value.id])
  const premiumCandidates = sorted.filter(p => !excluded.has(p.id))
  const premiumPool = premiumCandidates.length > 0 ? premiumCandidates : sorted

  const premium = premiumPool.reduce((best, plan) => {
    if ((plan.downloadSpeed || 0) > (best.downloadSpeed || 0)) return plan
    if ((plan.downloadSpeed || 0) === (best.downloadSpeed || 0) && plan.monthlyPrice > best.monthlyPrice) return plan
    return best
  }, premiumPool[premiumPool.length - 1])

  return { budget, value, premium }
}

/**
 * Format speed for display
 */
export function formatSpeed(speedMbps: number | null): string {
  if (!speedMbps) return 'N/A'
  if (speedMbps >= 1000) {
    const gbps = speedMbps / 1000
    return `${gbps % 1 === 0 ? gbps.toFixed(0) : gbps.toFixed(1)} Gbps`
  }
  return `${speedMbps} Mbps`
}

/**
 * Format price for display
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'N/A'
  return `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`
}

/**
 * Get plan features as array of strings
 */
export function getPlanFeatures(plan: RealPlan): string[] {
  const features: string[] = []

  // Symmetric speeds
  if (plan.uploadSpeed && plan.downloadSpeed && plan.uploadSpeed === plan.downloadSpeed) {
    features.push('Symmetric speeds')
  }

  // Data cap status
  if (plan.isUnlimited) {
    features.push('No data caps')
  } else if (plan.dataGb) {
    features.push(`${plan.dataGb} GB/month`)
  }

  // Contract status
  if (!plan.contractRequired) {
    features.push('No contract')
  } else if (plan.contractMonths) {
    features.push(`${plan.contractMonths}-month contract`)
  }

  // Intro rate
  if (plan.hasIntroRate && plan.introPrice) {
    features.push(`Intro rate: ${formatPrice(plan.introPrice)}/mo`)
  }

  // Latency (good for gaming)
  if (plan.latency && plan.latency <= 15) {
    features.push(`${plan.latency}ms latency`)
  }

  return features
}

/**
 * Get tier label for a plan
 */
export function getTierLabel(tier: 'budget' | 'value' | 'premium'): string {
  switch (tier) {
    case 'budget':
      return 'Budget Pick'
    case 'value':
      return 'Best Value'
    case 'premium':
      return 'Premium'
  }
}

/**
 * Get tier description based on plan characteristics
 */
export function getTierDescription(plan: RealPlan, tier: 'budget' | 'value' | 'premium'): string {
  const speed = plan.downloadSpeed || 0

  switch (tier) {
    case 'budget':
      if (speed >= 100) return 'Great entry-level option for streaming and browsing'
      return 'Basic internet for light usage'
    case 'value':
      if (speed >= 500) return 'Best balance of speed and price for most households'
      return 'Good all-around option for families'
    case 'premium':
      if (speed >= 1000) return 'Ultra-fast for power users and large households'
      return 'Top-tier speeds for demanding usage'
  }
}
