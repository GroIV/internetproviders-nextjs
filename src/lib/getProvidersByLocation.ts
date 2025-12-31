import { createAdminClient } from '@/lib/supabase/server'

export interface ProviderWithCoverage {
  id: number
  name: string
  slug: string
  technologies: string[]
  category: string
  coveragePercent: number
}

/**
 * Get providers available at a specific ZIP code, optionally filtered by technology
 */
export async function getProvidersByZip(
  zipCode: string,
  technology?: 'Fiber' | 'Cable' | 'DSL' | '5G' | 'Satellite' | 'Fixed Wireless'
): Promise<ProviderWithCoverage[]> {
  if (!zipCode || !/^\d{5}$/.test(zipCode)) {
    return []
  }

  const supabase = createAdminClient()

  // Use optimized RPC function that combines ZIP lookup with provider query
  const { data: mappedProviders, error } = await supabase.rpc('get_providers_by_zip', {
    zip: zipCode
  })

  if (error || !mappedProviders || mappedProviders.length === 0) {
    return []
  }

  // Deduplicate by provider_slug (multiple FCC entities can map to the same provider)
  const bySlug = new Map<string, ProviderWithCoverage>()

  for (const p of mappedProviders) {
    const slug = p.provider_slug as string
    const coveragePercent = Math.round(p.coverage_pct as number)
    const technologies = (p.technologies as string[] | null) || []

    // Filter by technology if specified
    if (technology && !technologies.includes(technology)) continue

    const existing = bySlug.get(slug)
    if (existing && existing.coveragePercent >= coveragePercent) continue

    bySlug.set(slug, {
      id: p.our_provider_id as number,
      name: p.provider_name as string,
      slug,
      technologies,
      category: 'internet',
      coveragePercent,
    })
  }

  const results = [...bySlug.values()]

  // Smart sorting: prioritize by technology quality, then by coverage
  // Fiber/Cable/5G should appear before Satellite/DSL in metro areas
  const getTechnologyScore = (techs: string[]): number => {
    // Higher score = better technology (appears first)
    if (techs.includes('Fiber')) return 100
    if (techs.includes('Cable')) return 80
    if (techs.includes('5G')) return 70
    if (techs.includes('Fixed Wireless')) return 50
    if (techs.includes('DSL')) return 30
    if (techs.includes('Satellite')) return 10  // Satellite last - only good for rural
    return 0
  }

  // Check if this is a metro area (has fiber/cable options)
  const hasGoodOptions = results.some(p =>
    p.technologies.includes('Fiber') || p.technologies.includes('Cable')
  )

  // If metro area with good options, deprioritize satellite
  // If rural (no fiber/cable), keep original coverage-based sorting
  if (hasGoodOptions) {
    results.sort((a, b) => {
      const scoreA = getTechnologyScore(a.technologies)
      const scoreB = getTechnologyScore(b.technologies)

      // If same technology tier, sort by coverage
      if (scoreA === scoreB) {
        return b.coveragePercent - a.coveragePercent
      }

      return scoreB - scoreA
    })
  }
  // If rural, keep original order (sorted by coverage_pct from DB)

  return results
}

/**
 * Get city name for a ZIP code
 */
export async function getCityForZip(zipCode: string): Promise<string | null> {
  if (!zipCode || !/^\d{5}$/.test(zipCode)) {
    return null
  }

  const supabase = createAdminClient()

  const { data } = await supabase
    .from('zip_broadband_coverage')
    .select('city')
    .eq('zip_code', zipCode)
    .single()

  return data?.city || null
}

/**
 * Get all providers of a specific technology type (for national rankings)
 */
export async function getProvidersByTechnology(
  technology: 'Fiber' | 'Cable' | 'DSL' | '5G' | 'Satellite' | 'Fixed Wireless'
): Promise<Array<{ id: number; name: string; slug: string; technologies: string[]; category: string }>> {
  const supabase = createAdminClient()

  const { data: providers } = await supabase
    .from('providers')
    .select('id, name, slug, technologies, category')
    .contains('technologies', [technology])
    .order('name')

  return providers || []
}

/**
 * Get the ZIP code coverage count for a provider
 * This matches our provider to FCC provider(s) and counts the ZIPs in their CBSA coverage
 */
export async function getProviderCoverageCount(providerName: string): Promise<number> {
  const supabase = createAdminClient()

  // Prefer deterministic FCC mapping when available
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('name', providerName)
    .single()

  if (provider?.id) {
    const { data: fccMappings } = await supabase
      .from('provider_fcc_map')
      .select('fcc_provider_id')
      .eq('provider_id', provider.id)

    const fccIds = (fccMappings || []).map(m => m.fcc_provider_id).filter(Boolean)

    if (fccIds.length > 0) {
      const { data: cbsaData } = await supabase
        .from('cbsa_providers')
        .select('cbsa_code')
        .in('provider_id', fccIds)

      const uniqueCbsaCodes = [...new Set((cbsaData || []).map(d => d.cbsa_code))]

      if (uniqueCbsaCodes.length > 0) {
        const { count } = await supabase
          .from('zip_cbsa_mapping')
          .select('*', { count: 'exact', head: true })
          .in('cbsa_code', uniqueCbsaCodes)

        return count || 0
      }
    }
  }

  // Provider name variations for FCC database search
  const nameVariations: Record<string, string[]> = {
    'Spectrum': ['charter'],
    'Xfinity': ['comcast'],
    'AT&T Internet': ['at&t'],
    'Verizon Fios': ['verizon'],
    'Cox Internet': ['cox'],
    'Frontier': ['frontier'],
    'CenturyLink': ['centurylink', 'lumen'],
    'Optimum': ['altice', 'cablevision'],
    'Mediacom': ['mediacom'],
    'Windstream': ['windstream'],
    'WOW!': ['wide open west', 'wideopenwest'],
    'Astound Broadband': ['rcn', 'grande', 'wave broadband'],
    'Google Fiber': ['google fiber'],
    'Metronet': ['metronet'],
    'Ziply Fiber': ['ziply'],
    'Brightspeed': ['brightspeed'],
    'EarthLink': ['earthlink'],
    'HughesNet': ['hughes'],
    'Viasat': ['viasat'],
    'Starlink': ['spacex', 'starlink'],
    'T-Mobile': ['t-mobile'],
  }

  // Build search patterns for this provider
  const searchTerms = [providerName.toLowerCase()]
  const variations = nameVariations[providerName]
  if (variations) {
    searchTerms.push(...variations)
  }

  // Search FCC providers using ilike for each search term
  const matchingFccIds: string[] = []

  for (const term of searchTerms) {
    const { data: fccMatches } = await supabase
      .from('fcc_providers')
      .select('provider_id')
      .ilike('name', `%${term}%`)

    if (fccMatches) {
      matchingFccIds.push(...fccMatches.map(f => f.provider_id))
    }
  }

  // Deduplicate
  const uniqueFccIds = [...new Set(matchingFccIds)]

  if (uniqueFccIds.length === 0) {
    return 0
  }

  // Get CBSA codes for these FCC providers
  const { data: cbsaData } = await supabase
    .from('cbsa_providers')
    .select('cbsa_code')
    .in('provider_id', uniqueFccIds)

  if (!cbsaData || cbsaData.length === 0) {
    return 0
  }

  // Get unique CBSA codes
  const uniqueCbsaCodes = [...new Set(cbsaData.map(d => d.cbsa_code))]

  // Count ZIPs in these CBSAs
  const { count } = await supabase
    .from('zip_cbsa_mapping')
    .select('*', { count: 'exact', head: true })
    .in('cbsa_code', uniqueCbsaCodes)

  return count || 0
}
