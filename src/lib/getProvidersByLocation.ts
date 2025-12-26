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

  // Step 1: Get CBSA code for this ZIP
  const { data: zipData } = await supabase
    .from('zip_cbsa_mapping')
    .select('cbsa_code')
    .eq('zip_code', zipCode)
    .single()

  if (!zipData?.cbsa_code) {
    return []
  }

  // Step 2: Get provider IDs and coverage for this CBSA
  const { data: cbsaProviders } = await supabase
    .from('cbsa_providers')
    .select('provider_id, coverage_pct')
    .eq('cbsa_code', zipData.cbsa_code)
    .order('coverage_pct', { ascending: false })

  if (!cbsaProviders || cbsaProviders.length === 0) {
    return []
  }

  // Step 3: Get provider names from fcc_providers
  const providerIds = cbsaProviders.map(p => p.provider_id)
  const { data: fccProviders } = await supabase
    .from('fcc_providers')
    .select('provider_id, name')
    .in('provider_id', providerIds)

  if (!fccProviders) {
    return []
  }

  // Create name lookup map
  const fccNameMap = new Map(fccProviders.map(p => [p.provider_id, p.name]))

  // Step 4: Get our provider records with technology info
  const { data: ourProviders } = await supabase
    .from('providers')
    .select('id, name, slug, technologies, category')

  if (!ourProviders) {
    return []
  }

  // Create lookup by name (normalized)
  const providerMap = new Map<string, typeof ourProviders[0]>()
  ourProviders.forEach(p => {
    providerMap.set(p.name.toLowerCase(), p)
    // Also add common variations
    if (p.name === 'Spectrum') providerMap.set('charter communications', p)
    if (p.name === 'Xfinity') providerMap.set('comcast', p)
    if (p.name === 'AT&T Internet') providerMap.set('at&t', p)
    if (p.name === 'AT&T Internet') providerMap.set('at&t services', p)
    // NOTE: Don't map generic "verizon" to "Verizon Fios" - FCC "Verizon Communications Inc."
    // includes DSL, 5G Home, AND Fios. Verizon Fios is only available in specific East Coast states.
    // Map to Verizon 5G Home instead if that provider exists, otherwise skip.
    if (p.name === 'Verizon 5G Home') providerMap.set('verizon', p)
    if (p.name === 'Cox Internet') providerMap.set('cox communications', p)
    if (p.slug === 'frontier') providerMap.set('frontier communications', p)
  })

  // Step 5: Match FCC providers to our providers and include coverage
  const results: ProviderWithCoverage[] = []
  const seenSlugs = new Set<string>()

  for (const cbsaProvider of cbsaProviders) {
    const fccName = fccNameMap.get(cbsaProvider.provider_id)
    if (!fccName) continue

    // Try to match to our provider
    const normalizedName = fccName.toLowerCase()
      .replace(/,?\s*(inc\.?|corporation|corp\.?|llc|l\.l\.c\.?|holdings|services|communications?)$/gi, '')
      .trim()

    let ourProvider = providerMap.get(normalizedName)

    // Try partial matching if direct match fails
    if (!ourProvider) {
      for (const [key, value] of providerMap) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
          ourProvider = value
          break
        }
      }
    }

    if (!ourProvider) continue

    // Skip duplicates
    if (seenSlugs.has(ourProvider.slug)) continue
    seenSlugs.add(ourProvider.slug)

    // Filter by technology if specified
    if (technology && !ourProvider.technologies?.includes(technology)) {
      continue
    }

    results.push({
      id: ourProvider.id,
      name: ourProvider.name,
      slug: ourProvider.slug,
      technologies: ourProvider.technologies || [],
      category: ourProvider.category || '',
      coveragePercent: Math.round(cbsaProvider.coverage_pct * 100),
    })
  }

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
