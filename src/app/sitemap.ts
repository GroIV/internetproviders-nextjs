import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Dynamic Sitemap Generator for InternetProviders.ai
 *
 * SEO Migration Phase 1 - Trust Layer Approach
 *
 * INCLUDED (launch sitemaps):
 * - Static pages (home, about, contact, etc.)
 * - /providers/* (all provider pages)
 * - /guides/* (guide templates)
 * - /compare/* (comparison pages)
 * - /best/* and /fastest/* (ranking pages)
 * - /internet/* (state and city pages)
 *
 * EXCLUDED (until trust established):
 * - /zip/* pages (per SEO plan - KILL category)
 * - /api/* routes
 * - /offline, /test-widgets
 */

const BASE_URL = 'https://www.internetproviders.ai'

// Guide template slugs (matching /guides/[slug]/page.tsx)
const guideTemplates = [
  'best-internet-providers',
  'budget',
  'speed',
  'fiber',
  'gaming',
  'streaming',
  'work-from-home',
  'no-contract',
  'family',
]

// Static pages with their priorities and change frequencies
const staticPages: Array<{
  path: string
  priority: number
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}> = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/providers', priority: 0.9, changeFrequency: 'weekly' },
  // High-intent monetization hub (Frontier Fiber)
  { path: '/providers/frontier-fiber/availability', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/guides', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/compare', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/plans', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/deals', priority: 0.7, changeFrequency: 'daily' },
  { path: '/tools/speed-test', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/best/fiber-providers', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/best/cable-providers', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/fastest/internet-providers', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/cheapest/internet-providers', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
]

// US States for /internet/[state] pages
const usStates = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california',
  'colorado', 'connecticut', 'delaware', 'florida', 'georgia',
  'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
  'kansas', 'kentucky', 'louisiana', 'maine', 'maryland',
  'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri',
  'montana', 'nebraska', 'nevada', 'new-hampshire', 'new-jersey',
  'new-mexico', 'new-york', 'north-carolina', 'north-dakota', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'rhode-island', 'south-carolina',
  'south-dakota', 'tennessee', 'texas', 'utah', 'vermont',
  'virginia', 'washington', 'west-virginia', 'wisconsin', 'wyoming',
  'district-of-columbia',
]

// Popular provider comparison pairs
const comparisonPairs = [
  'xfinity-vs-spectrum',
  'att-internet-vs-spectrum',
  'att-internet-vs-xfinity',
  'verizon-fios-vs-xfinity',
  'verizon-fios-vs-spectrum',
  'frontier-vs-att-internet',
  'google-fiber-vs-att-internet',
  'cox-vs-xfinity',
  't-mobile-vs-starlink',
  'starlink-vs-viasat',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  // 1. Static pages
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // 2. Provider pages from database
  const { data: providers } = await supabase
    .from('providers')
    .select('slug, updated_at')
    .not('slug', 'is', null)

  const providerEntries: MetadataRoute.Sitemap = (providers || [])
    .filter((p) => p.slug)
    .map((provider) => ({
      url: `${BASE_URL}/providers/${provider.slug}`,
      lastModified: provider.updated_at || now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  // 3. Guide template pages
  const guideEntries: MetadataRoute.Sitemap = guideTemplates.map((slug) => ({
    url: `${BASE_URL}/guides/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // 4. Comparison pages
  const comparisonEntries: MetadataRoute.Sitemap = comparisonPairs.map((pair) => ({
    url: `${BASE_URL}/compare/${pair}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // 5. State pages (/internet/[state])
  const stateEntries: MetadataRoute.Sitemap = usStates.map((state) => ({
    url: `${BASE_URL}/internet/${state}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // 6. City pages from database (/internet/[state]/[city])
  const { data: cities } = await supabase
    .from('city_definitions')
    .select('state_slug, city_slug, updated_at')
    .order('state_slug')
    .order('city_slug')

  const cityEntries: MetadataRoute.Sitemap = (cities || [])
    .filter((c) => c.state_slug && c.city_slug)
    .map((city) => ({
      url: `${BASE_URL}/internet/${city.state_slug}/${city.city_slug}`,
      lastModified: city.updated_at || now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

  // NOTE: /go/* interstitial pages are intentionally EXCLUDED from sitemap
  // They are affiliate redirects, not content pages for search engines

  // Combine all entries
  return [
    ...staticEntries,
    ...providerEntries,
    ...guideEntries,
    ...comparisonEntries,
    ...stateEntries,
    ...cityEntries,
  ]
}
