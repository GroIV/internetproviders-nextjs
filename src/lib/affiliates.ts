/**
 * Affiliate Links Configuration
 *
 * Central database for all provider affiliate/order links.
 * Easy to update when links or tracking parameters change.
 *
 * Sub ID Format: IPAI{source}
 * - IPAIchat = clicked from chat
 * - IPAIhome = clicked from homepage
 * - IPAIguides = clicked from guides page
 * - IPAIproviders = clicked from providers listing
 * - IPAIcompare = clicked from comparison page
 * - IPAI{provider-slug} = clicked from specific provider page
 */

export interface AffiliateLink {
  providerId: string           // Internal ID (matches our provider slugs)
  providerName: string         // Display name
  baseUrl: string              // Base URL without sub_id
  subIdParam: string           // Parameter name for sub_id (usually 'sub_id')
  isActive: boolean            // Can disable links without removing
  notes?: string               // Internal notes about the link
}

// Master list of affiliate links - UPDATE HERE when links change
export const affiliateLinks: AffiliateLink[] = [
  {
    providerId: 'xfinity',
    providerName: 'Xfinity',
    baseUrl: 'https://www.myfinance.com/reporting/32346939/?utm_campaign=chameleon-konecteaze-xfinity-dl',
    subIdParam: 'sub_id',
    isActive: true,
  },
  {
    providerId: 'cox',
    providerName: 'Cox',
    baseUrl: 'https://www.myfinance.com/reporting/32346940/?utm_campaign=chameleon-konecteaze-cox-dl',
    subIdParam: 'sub_id',
    isActive: true,
  },
  {
    providerId: 'verizon-fios',
    providerName: 'Verizon',
    baseUrl: 'https://www.myfinance.com/reporting/32346941/?utm_campaign=chameleon-konecteaze-verizon-dl',
    subIdParam: 'sub_id',
    isActive: true,
  },
  {
    providerId: 'frontier',
    providerName: 'Frontier',
    baseUrl: 'https://www.myfinance.com/reporting/32346942/?utm_campaign=chameleon-konecteaze-frontier-dl',
    subIdParam: 'sub_id',
    isActive: true,
  },
  {
    providerId: 'google-fiber',
    providerName: 'Google Fiber',
    baseUrl: 'https://www.myfinance.com/reporting/32346943/?utm_campaign=chameleon-konecteaze-googlefiber-dl',
    subIdParam: 'sub_id',
    isActive: true,
  },
  {
    providerId: 't-mobile',
    providerName: 'T-Mobile',
    baseUrl: 'https://www.myfinance.com/reporting/32346944/?utm_campaign=chameleon-konecteaze-tmobile-dl',
    subIdParam: 'sub_id',
    isActive: true,
  },
  {
    providerId: 'hughesnet',
    providerName: 'HughesNet',
    baseUrl: 'https://www.myfinance.com/reporting/32346946/?utm_campaign=chameleon-konecteaze-hughesnet-dl',
    subIdParam: 'sub_id',
    isActive: true,
  },
  {
    providerId: 'att-internet',
    providerName: 'AT&T',
    baseUrl: 'https://www.myfinance.com/reporting/32346948/?utm_campaign=chameleon-konecteaze-att-dl',
    subIdParam: 'sub_id',
    isActive: true,
  },
]

// Create lookup map for quick access by provider ID
const affiliateLinkMap = new Map<string, AffiliateLink>(
  affiliateLinks.map(link => [link.providerId, link])
)

// Also create lookup by provider name (case-insensitive)
const affiliateLinkByName = new Map<string, AffiliateLink>(
  affiliateLinks.map(link => [link.providerName.toLowerCase(), link])
)

/**
 * Source types for tracking where orders originate
 */
export type OrderSource =
  | 'chat'           // From AI chat
  | 'home'           // From homepage
  | 'providers'      // From providers listing page
  | 'compare'        // From comparison pages
  | 'guides'         // From guides pages
  | 'deals'          // From deals page
  | 'tools'          // From tools pages
  | string           // Custom source (e.g., provider slug for provider pages)

/**
 * Generate a tracked affiliate URL
 *
 * @param providerId - Provider slug (e.g., 'xfinity', 'att-internet')
 * @param source - Where the link was clicked (e.g., 'chat', 'home', 'xfinity')
 * @returns Full URL with tracking sub_id, or null if provider not found/inactive
 */
export function getAffiliateUrl(providerId: string, source: OrderSource): string | null {
  const link = affiliateLinkMap.get(providerId)

  if (!link || !link.isActive) {
    return null
  }

  // Build sub_id: IPAI + source
  const subId = `IPAI${source}`

  // Construct full URL
  const separator = link.baseUrl.includes('?') ? '&' : '?'
  return `${link.baseUrl}${separator}${link.subIdParam}=${subId}`
}

/**
 * Get affiliate URL by provider name (case-insensitive)
 * Useful for chat where users might type "Xfinity" or "xfinity"
 */
export function getAffiliateUrlByName(providerName: string, source: OrderSource): string | null {
  const link = affiliateLinkByName.get(providerName.toLowerCase())

  if (!link || !link.isActive) {
    return null
  }

  return getAffiliateUrl(link.providerId, source)
}

/**
 * Get affiliate link info (without generating URL)
 */
export function getAffiliateInfo(providerId: string): AffiliateLink | null {
  return affiliateLinkMap.get(providerId) || null
}

/**
 * Check if a provider has an active affiliate link
 */
export function hasAffiliateLink(providerId: string): boolean {
  const link = affiliateLinkMap.get(providerId)
  return link?.isActive ?? false
}

/**
 * Get all active providers with affiliate links
 */
export function getActiveAffiliateProviders(): AffiliateLink[] {
  return affiliateLinks.filter(link => link.isActive)
}

/**
 * Determine the source string from a pathname
 * Used to automatically track which page the user was on
 */
export function getSourceFromPathname(pathname: string): OrderSource {
  if (pathname === '/') return 'home'
  if (pathname === '/providers') return 'providers'
  if (pathname.startsWith('/providers/')) {
    // Return the provider slug as the source
    return pathname.split('/providers/')[1] || 'providers'
  }
  if (pathname.startsWith('/compare')) return 'compare'
  if (pathname.startsWith('/guides')) return 'guides'
  if (pathname === '/deals') return 'deals'
  if (pathname.startsWith('/tools')) return 'tools'
  if (pathname.startsWith('/best') || pathname.startsWith('/fastest') || pathname.startsWith('/cheapest')) {
    return 'rankings'
  }
  if (pathname.startsWith('/internet')) return 'location'

  // Default to the pathname without leading slash
  return pathname.slice(1) || 'unknown'
}

/**
 * Format provider names for display
 * Maps our internal IDs to proper display names
 */
export const providerDisplayNames: Record<string, string> = {
  'xfinity': 'Xfinity',
  'cox': 'Cox',
  'verizon-fios': 'Verizon Fios',
  'frontier': 'Frontier',
  'google-fiber': 'Google Fiber',
  't-mobile': 'T-Mobile 5G Home Internet',
  'hughesnet': 'HughesNet',
  'att-internet': 'AT&T Internet',
  'spectrum': 'Spectrum',
  'centurylink': 'CenturyLink',
  'optimum': 'Optimum',
  'windstream': 'Windstream',
  'mediacom': 'Mediacom',
  'earthlink': 'EarthLink',
  'starlink': 'Starlink',
  'viasat': 'Viasat',
}
