// Provider name to slug mapping
// Maps raw FCC provider names to our clean provider slugs

export const providerSlugMap: Record<string, string> = {
  // Major Cable - slugs must match database exactly
  'charter communications': 'spectrum',
  'charter': 'spectrum',
  'spectrum': 'spectrum',
  'comcast': 'xfinity',
  'comcast cable': 'xfinity',
  'xfinity': 'xfinity',
  'cox communications': 'cox',
  'cox': 'cox',
  'wow': 'wow',
  'wideopenwest': 'wow',
  'wide open west': 'wow',
  'astound broadband': 'astound-broadband',
  'astound': 'astound-broadband',
  'rcn': 'astound-broadband',
  'grande': 'astound-broadband',

  // Fiber/Telco - slugs must match database exactly
  'at&t': 'att-internet',
  'at&t services': 'att-internet',
  'att': 'att-internet',
  'at&t internet': 'att-internet',
  'verizon': 'verizon-fios',
  'verizon fios': 'verizon-fios',
  'verizon communications': 'verizon-fios',
  'frontier': 'frontier-fiber',
  'frontier communications': 'frontier-fiber',
  'frontier fiber': 'frontier-fiber',
  'consolidated communications': 'consolidated-communications',
  'consolidated': 'consolidated-communications',
  'ziply fiber': 'ziply-fiber',
  'ziply': 'ziply-fiber',
  'google fiber': 'google-fiber',
  'tds telecom': 'tds-telecom',
  'tds': 'tds-telecom',

  // Satellite - slugs must match database exactly
  'hughesnet': 'hughesnet',
  'hughes network systems': 'hughesnet',
  'hughes': 'hughesnet',
  'viasat': 'viasat',
  'echostar': 'viasat',

  // Regional Fiber
  'metronet': 'metronet',
  'rise broadband': 'rise-broadband',
  'rise': 'rise-broadband',
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
