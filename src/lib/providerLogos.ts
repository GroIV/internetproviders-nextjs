/**
 * Provider Logo Helper
 *
 * Centralized management of provider logos with fallback support.
 * Logos are stored in /public/providers/{slug}.png (or .jpg)
 */

// Providers with available logos
const availableLogos: Record<string, { file: string; needsLightBg?: boolean }> = {
  'altafiber': { file: 'altafiber.png' },
  'astound-broadband': { file: 'astound-broadband.png' },
  'att-internet': { file: 'att-internet.png', needsLightBg: true },
  'breezeline': { file: 'breezeline.png' },
  'buckeye-cable': { file: 'buckeye-cable.png', needsLightBg: true },
  'centurylink': { file: 'centurylink.jpg' },
  'consolidated-communications': { file: 'consolidated-communications.png', needsLightBg: true },
  'cox': { file: 'cox.png' },
  'directv': { file: 'directv.png' },
  'dish': { file: 'dish.jpg', needsLightBg: true },
  'frontier': { file: 'frontier.png' },
  'frontier-fiber': { file: 'frontier-fiber.png' },
  'hughesnet': { file: 'hughesnet.png', needsLightBg: true },
  'mediacom': { file: 'mediacom.png' },
  'metronet': { file: 'metronet.png', needsLightBg: true },
  'optimum': { file: 'optimum.png', needsLightBg: true },
  'spectrum': { file: 'spectrum.png', needsLightBg: true },
  'tds-telecom': { file: 'tds-telecom.png', needsLightBg: true },
  'verizon-fios': { file: 'verizon-fios.jpg', needsLightBg: true },
  'windstream': { file: 'windstream.png', needsLightBg: true },
  'wow': { file: 'wow.jpg', needsLightBg: true },
  'xfinity': { file: 'xfinity.jpg' },
  'ziply-fiber': { file: 'ziply-fiber.png', needsLightBg: true },
}

// Brand colors for fallback display (when no logo available)
export const providerColors: Record<string, { bg: string; text: string }> = {
  'altafiber': { bg: 'bg-blue-600', text: 'text-white' },
  'astound-broadband': { bg: 'bg-blue-700', text: 'text-white' },
  'att-internet': { bg: 'bg-blue-500', text: 'text-white' },
  'breezeline': { bg: 'bg-teal-500', text: 'text-white' },
  'brightspeed': { bg: 'bg-orange-500', text: 'text-white' },
  'buckeye-cable': { bg: 'bg-red-600', text: 'text-white' },
  'centurylink': { bg: 'bg-green-600', text: 'text-white' },
  'consolidated-communications': { bg: 'bg-blue-600', text: 'text-white' },
  'cox': { bg: 'bg-blue-600', text: 'text-white' },
  'directv': { bg: 'bg-blue-500', text: 'text-white' },
  'dish': { bg: 'bg-red-600', text: 'text-white' },
  'earthlink': { bg: 'bg-blue-700', text: 'text-white' },
  'frontier': { bg: 'bg-red-600', text: 'text-white' },
  'frontier-fiber': { bg: 'bg-red-600', text: 'text-white' },
  'google-fiber': { bg: 'bg-blue-500', text: 'text-white' },
  'hughesnet': { bg: 'bg-blue-700', text: 'text-white' },
  'mediacom': { bg: 'bg-green-600', text: 'text-white' },
  'metronet': { bg: 'bg-green-500', text: 'text-white' },
  'optimum': { bg: 'bg-amber-500', text: 'text-black' },
  'spectrum': { bg: 'bg-blue-800', text: 'text-white' },
  'starlink': { bg: 'bg-slate-700', text: 'text-white' },
  't-mobile': { bg: 'bg-pink-600', text: 'text-white' },
  'tds-telecom': { bg: 'bg-green-600', text: 'text-white' },
  'verizon-fios': { bg: 'bg-red-600', text: 'text-white' },
  'viasat': { bg: 'bg-blue-600', text: 'text-white' },
  'windstream': { bg: 'bg-purple-600', text: 'text-white' },
  'wow': { bg: 'bg-orange-500', text: 'text-white' },
  'xfinity': { bg: 'bg-purple-600', text: 'text-white' },
  'ziply-fiber': { bg: 'bg-green-500', text: 'text-white' },
}

// Default color for unknown providers
const defaultColor = { bg: 'bg-gray-600', text: 'text-white' }

/**
 * Check if a provider has an available logo
 */
export function hasProviderLogo(slug: string): boolean {
  return slug in availableLogos
}

/**
 * Get the logo path for a provider
 * Returns null if no logo available
 */
export function getProviderLogoPath(slug: string): string | null {
  const logo = availableLogos[slug]
  if (!logo) return null
  return `/providers/${logo.file}`
}

/**
 * Check if logo needs a light background container
 */
export function logoNeedsLightBg(slug: string): boolean {
  return availableLogos[slug]?.needsLightBg ?? false
}

/**
 * Get brand colors for a provider (used for fallback)
 */
export function getProviderColors(slug: string): { bg: string; text: string } {
  return providerColors[slug] || defaultColor
}

/**
 * Get provider initials for fallback display
 */
export function getProviderInitials(name: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'AT&T Internet': 'AT&T',
    'AT&T': 'AT&T',
    'T-Mobile 5G Home Internet': 'T-Mo',
    'T-Mobile': 'T-Mo',
    'WOW!': 'WOW',
    'DIRECTV': 'DTV',
    'DISH Network': 'DISH',
    'HughesNet': 'HN',
    'CenturyLink': 'CL',
    'EarthLink': 'EL',
  }

  if (specialCases[name]) {
    return specialCases[name]
  }

  // Get first letter of each word, max 3 chars
  const words = name.split(/[\s-]+/)
  if (words.length === 1) {
    return name.substring(0, 2).toUpperCase()
  }
  return words
    .slice(0, 3)
    .map(w => w.charAt(0).toUpperCase())
    .join('')
}

/**
 * Get complete logo info for a provider
 */
export interface ProviderLogoInfo {
  hasLogo: boolean
  logoPath: string | null
  needsLightBg: boolean
  fallbackBg: string
  fallbackText: string
  initials: string
}

export function getProviderLogoInfo(slug: string, name: string): ProviderLogoInfo {
  const colors = getProviderColors(slug)
  return {
    hasLogo: hasProviderLogo(slug),
    logoPath: getProviderLogoPath(slug),
    needsLightBg: logoNeedsLightBg(slug),
    fallbackBg: colors.bg,
    fallbackText: colors.text,
    initials: getProviderInitials(name),
  }
}
