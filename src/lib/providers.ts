// Provider name to slug mapping
// Maps raw FCC provider names to our clean provider slugs

export const providerSlugMap: Record<string, string> = {
  // Major Cable
  'charter communications': 'spectrum',
  'charter': 'spectrum',
  'spectrum': 'spectrum',
  'comcast': 'xfinity',
  'comcast cable': 'xfinity',
  'xfinity': 'xfinity',
  'cox communications': 'cox',
  'cox': 'cox',
  'altice usa': 'optimum',
  'optimum': 'optimum',
  'cablevision': 'optimum',
  'mediacom': 'mediacom',
  'mediacom communications': 'mediacom',
  'suddenlink': 'suddenlink',
  'atlantic broadband': 'atlantic-broadband',
  'wow': 'wow',
  'wideopenwest': 'wow',
  'rcn': 'rcn',
  'astound broadband': 'astound',
  'grande communications': 'grande',

  // Fiber/Telco
  'at&t': 'att',
  'at&t services': 'att',
  'att': 'att',
  'verizon': 'verizon',
  'verizon fios': 'verizon',
  'frontier': 'frontier',
  'frontier communications': 'frontier',
  'centurylink': 'centurylink',
  'lumen': 'centurylink',
  'windstream': 'windstream',
  'windstream holdings': 'windstream',
  'consolidated communications': 'consolidated',
  'cincinnati bell': 'cincinnati-bell',
  'altafiber': 'altafiber',
  'ziply fiber': 'ziply',
  'ziply': 'ziply',
  'google fiber': 'google-fiber',
  'earthlink': 'earthlink',
  'sonic': 'sonic',
  'c spire': 'c-spire',

  // 5G/Wireless
  't-mobile': 't-mobile',
  't-mobile home internet': 't-mobile',
  'verizon wireless': 'verizon',
  'verizon 5g': 'verizon',
  'starry': 'starry',

  // Satellite
  'hughesnet': 'hughesnet',
  'hughes network systems': 'hughesnet',
  'viasat': 'viasat',
  'echostar': 'viasat',
  'starlink': 'starlink',
  'space exploration technologies': 'starlink',
  'spacex': 'starlink',

  // Regional Fiber
  'epb': 'epb',
  'epb fiber': 'epb',
  'allo': 'allo',
  'allo communications': 'allo',
  'metronet': 'metronet',
  'lumos': 'lumos',
  'fidium': 'fidium',
  'fidium fiber': 'fidium',
  'quantum fiber': 'quantum-fiber',
  'brightspeed': 'brightspeed',
  'breezeline': 'breezeline',
  'usa communications': 'usa-communications',
  'gvtc': 'gvtc',
  'tachus': 'tachus',
}

/**
 * Get the slug for a provider name
 * Returns null if no match found
 */
export function getProviderSlug(name: string): string | null {
  if (!name) return null

  // Clean the name
  const cleanName = name
    .toLowerCase()
    .replace(/,?\s*(inc\.?|corporation|corp\.?|llc|l\.l\.c\.?|holdings|services|communications?)$/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Direct match
  if (providerSlugMap[cleanName]) {
    return providerSlugMap[cleanName]
  }

  // Try partial matches
  for (const [key, slug] of Object.entries(providerSlugMap)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return slug
    }
  }

  return null
}

/**
 * Clean a provider name for display
 */
export function cleanProviderName(name: string): string {
  return name
    .replace(/,?\s*(Inc\.?|Corporation|Corp\.?|LLC|L\.L\.C\.?|Holdings|Services)$/gi, '')
    .replace('Space Exploration Technologies', 'Starlink')
    .replace('Charter Communications', 'Spectrum')
    .replace('Comcast Cable', 'Xfinity')
    .trim()
}

/**
 * Get provider link href or null if not found
 */
export function getProviderHref(name: string): string | null {
  const slug = getProviderSlug(name)
  return slug ? `/providers/${slug}` : null
}
