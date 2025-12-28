/**
 * Server-side utility for fetching city data from Supabase
 * Uses city_definitions, city_availability_v1, and cbsa_top_providers_v1 views
 */

import { createAdminClient } from '@/lib/supabase/server'

export interface CityDefinition {
  id: number
  state_slug: string
  state_abbr: string
  city_slug: string
  city_name: string
  representative_zip: string
  cbsa_code: string | null
}

export interface CityAvailability {
  fiberCoverage: number | null
  cableCoverage: number | null
  fixedWirelessCoverage: number | null
  anyCoverage: number | null
  cbsaCode: string | null
}

export interface CityProvider {
  providerSlug: string
  providerName: string
  technologies: string[] | null
  coveragePct: number
  mappingConfidence: number
}

export interface CityData {
  city: CityDefinition
  availability: CityAvailability | null
  providers: CityProvider[]
}

/**
 * Look up city from city_definitions table
 */
export async function getCityDefinition(
  stateSlug: string,
  citySlug: string
): Promise<CityDefinition | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('city_definitions')
    .select('*')
    .eq('state_slug', stateSlug)
    .eq('city_slug', citySlug)
    .single()

  if (error || !data) {
    return null
  }

  return data as CityDefinition
}

/**
 * Get city availability from city_availability_v1 view
 */
export async function getCityAvailability(
  stateSlug: string,
  citySlug: string
): Promise<CityAvailability | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('city_availability_v1')
    .select('*')
    .eq('state_slug', stateSlug)
    .eq('city_slug', citySlug)
    .single()

  if (error || !data) {
    return null
  }

  return {
    fiberCoverage: data.fiber_100_20_pct ? Math.round(data.fiber_100_20_pct) : null,
    cableCoverage: data.cable_100_20_pct ? Math.round(data.cable_100_20_pct) : null,
    fixedWirelessCoverage: data.fixed_wireless_100_20_pct ? Math.round(data.fixed_wireless_100_20_pct) : null,
    anyCoverage: data.any_100_20_pct ? Math.round(data.any_100_20_pct) : null,
    cbsaCode: data.cbsa_code,
  }
}

/**
 * Get city providers from cbsa_top_providers_v1 view
 * Returns providers with deterministic slug mapping
 */
export async function getCityProviders(
  stateSlug: string,
  citySlug: string,
  limit: number = 15
): Promise<CityProvider[]> {
  const supabase = createAdminClient()

  // First get the CBSA code for this city
  const { data: cityData } = await supabase
    .from('city_definitions')
    .select('cbsa_code, representative_zip')
    .eq('state_slug', stateSlug)
    .eq('city_slug', citySlug)
    .single()

  if (!cityData) return []

  // If no cbsa_code on city, look it up from zip_cbsa_mapping
  let cbsaCode = cityData.cbsa_code
  if (!cbsaCode && cityData.representative_zip) {
    const { data: zipData } = await supabase
      .from('zip_cbsa_mapping')
      .select('cbsa_code')
      .eq('zip_code', cityData.representative_zip)
      .single()

    cbsaCode = zipData?.cbsa_code || null
  }

  return getProvidersByCbsa(cbsaCode, limit)
}

/**
 * Get providers by CBSA code directly (avoids redundant city lookup)
 */
export async function getProvidersByCbsa(
  cbsaCode: string | null,
  limit: number = 15
): Promise<CityProvider[]> {
  if (!cbsaCode) return []

  const supabase = createAdminClient()

  // Query cbsa_top_providers_v1 for providers with deterministic slug mapping
  const { data: providers, error } = await supabase
    .from('cbsa_top_providers_v1')
    .select('provider_slug, provider_name, technologies, coverage_pct, mapping_confidence')
    .eq('cbsa_code', cbsaCode)
    .order('coverage_pct', { ascending: false })
    .limit(limit)

  if (error || !providers) {
    return []
  }

  // Deduplicate by provider_slug (multiple FCC entities can map to the same provider)
  const bySlug = new Map<string, (typeof providers)[number]>()
  for (const p of providers) {
    const slug = p.provider_slug as string
    const existing = bySlug.get(slug)
    if (!existing || (p.coverage_pct as number) > (existing.coverage_pct as number)) {
      bySlug.set(slug, p)
    }
  }

  return [...bySlug.values()].map(p => ({
    providerSlug: p.provider_slug,
    providerName: p.provider_name,
    technologies: p.technologies,
    coveragePct: Math.round(p.coverage_pct),
    mappingConfidence: p.mapping_confidence,
  }))
}

/**
 * Get all city data in one call (definition, availability, providers)
 * Optimized: Uses city's cbsa_code to fetch providers in parallel (avoids redundant lookups)
 */
export async function getCityData(
  stateSlug: string,
  citySlug: string
): Promise<CityData | null> {
  const supabase = createAdminClient()

  // Single query to get city definition with cbsa_code
  const { data: city, error } = await supabase
    .from('city_definitions')
    .select('*')
    .eq('state_slug', stateSlug)
    .eq('city_slug', citySlug)
    .single()

  if (error || !city) {
    return null
  }

  // Resolve cbsa_code if not on city record
  let cbsaCode = city.cbsa_code
  if (!cbsaCode && city.representative_zip) {
    const { data: zipData } = await supabase
      .from('zip_cbsa_mapping')
      .select('cbsa_code')
      .eq('zip_code', city.representative_zip)
      .single()
    cbsaCode = zipData?.cbsa_code || null
  }

  // Parallel fetch: availability + providers (using resolved cbsa_code)
  const [availability, providers] = await Promise.all([
    getCityAvailability(stateSlug, citySlug),
    getProvidersByCbsa(cbsaCode),
  ])

  return {
    city: city as CityDefinition,
    availability,
    providers,
  }
}

/**
 * Get all city definitions for static generation
 */
export async function getAllCityDefinitions(): Promise<CityDefinition[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('city_definitions')
    .select('*')
    .order('state_slug')
    .order('city_slug')

  if (error || !data) {
    return []
  }

  return data as CityDefinition[]
}

/**
 * Categorize provider by technology
 */
export function categorizeProvider(provider: CityProvider): 'fiber' | 'cable' | 'wireless' | 'other' {
  const techs = provider.technologies || []

  if (techs.includes('Fiber')) return 'fiber'
  if (techs.includes('Cable')) return 'cable'
  if (techs.includes('5G') || techs.includes('Fixed Wireless') || techs.includes('Satellite')) return 'wireless'

  return 'other'
}
