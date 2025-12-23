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
    if (p.name === 'Verizon Fios') providerMap.set('verizon', p)
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
