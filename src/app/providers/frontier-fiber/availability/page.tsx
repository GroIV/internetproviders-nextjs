import { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { ProviderLogo } from '@/components/ProviderLogo'
import { JsonLd, generateBreadcrumbSchema } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Frontier Fiber Availability by City | Where Frontier Fiber is Available',
  description: 'Find Frontier Fiber availability in your city. See all cities where Frontier offers fiber internet with coverage data from the FCC.',
  alternates: {
    canonical: '/providers/frontier-fiber/availability',
  },
  openGraph: {
    title: 'Frontier Fiber Availability by City',
    description: 'Find Frontier Fiber availability in your city. Browse all markets where Frontier offers fiber internet.',
    url: '/providers/frontier-fiber/availability',
  },
}

interface FrontierCity {
  state_slug: string
  state_abbr: string
  city_slug: string
  city_name: string
  cbsa_code: string
  coverage_pct: number
  fiber_pct: number | null
}

async function getFrontierCities(): Promise<FrontierCity[]> {
  const supabase = createAdminClient()

  // Step 1: Get all Frontier CBSA markets with ≥20% coverage
  const { data: frontierMarkets, error: marketError } = await supabase
    .from('cbsa_top_providers_v1')
    .select('cbsa_code, coverage_pct')
    .eq('provider_slug', 'frontier-fiber')
    .gte('coverage_pct', 20)

  if (marketError || !frontierMarkets) {
    console.error('Error fetching Frontier markets:', marketError?.message)
    return []
  }

  // Deduplicate by cbsa_code, keeping max coverage
  const cbsaMap = new Map<string, number>()
  for (const m of frontierMarkets) {
    const existing = cbsaMap.get(m.cbsa_code)
    if (!existing || m.coverage_pct > existing) {
      cbsaMap.set(m.cbsa_code, m.coverage_pct)
    }
  }

  const cbsaCodes = Array.from(cbsaMap.keys())

  if (cbsaCodes.length === 0) {
    return []
  }

  // Step 2: Get city definitions that have these CBSAs
  const { data: cities, error: cityError } = await supabase
    .from('city_definitions')
    .select('state_slug, state_abbr, city_slug, city_name, cbsa_code')
    .in('cbsa_code', cbsaCodes)

  if (cityError || !cities) {
    console.error('Error fetching cities:', cityError?.message)
    return []
  }

  // Step 3: Get fiber coverage data for these cities
  const cityKeys = cities.map(c => `${c.state_slug}:${c.city_slug}`)
  const { data: availability, error: availError } = await supabase
    .from('city_availability_v1')
    .select('state_slug, city_slug, fiber_100_20_pct')

  const fiberMap = new Map<string, number | null>()
  if (availability) {
    for (const a of availability) {
      fiberMap.set(`${a.state_slug}:${a.city_slug}`, a.fiber_100_20_pct)
    }
  }

  // Step 4: Combine and sort
  const result: FrontierCity[] = cities
    .filter(c => c.cbsa_code && cbsaMap.has(c.cbsa_code))
    .map(c => ({
      state_slug: c.state_slug,
      state_abbr: c.state_abbr,
      city_slug: c.city_slug,
      city_name: c.city_name,
      cbsa_code: c.cbsa_code,
      coverage_pct: cbsaMap.get(c.cbsa_code) || 0,
      fiber_pct: fiberMap.get(`${c.state_slug}:${c.city_slug}`) || null,
    }))
    .sort((a, b) => {
      // Primary: coverage_pct desc
      if (b.coverage_pct !== a.coverage_pct) {
        return b.coverage_pct - a.coverage_pct
      }
      // Secondary: fiber_pct desc
      const fiberA = a.fiber_pct ?? 0
      const fiberB = b.fiber_pct ?? 0
      return fiberB - fiberA
    })

  return result
}

// Group cities by state for better navigation
function groupByState(cities: FrontierCity[]): Record<string, FrontierCity[]> {
  const grouped: Record<string, FrontierCity[]> = {}
  for (const city of cities) {
    if (!grouped[city.state_abbr]) {
      grouped[city.state_abbr] = []
    }
    grouped[city.state_abbr].push(city)
  }
  return grouped
}

export default async function FrontierFiberAvailabilityPage() {
  const cities = await getFrontierCities()
  const groupedCities = groupByState(cities)
  const stateOrder = Object.keys(groupedCities).sort()

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Providers', url: '/providers' },
    { name: 'Frontier Fiber', url: '/providers/frontier-fiber' },
    { name: 'Availability', url: '/providers/frontier-fiber/availability' },
  ])

  // ItemList schema for the cities
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Frontier Fiber Availability by City',
    description: 'Cities where Frontier Fiber internet is available',
    numberOfItems: cities.length,
    itemListElement: cities.slice(0, 50).map((city, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${city.city_name}, ${city.state_abbr}`,
      url: `https://www.internetproviders.ai/internet/${city.state_slug}/${city.city_slug}`,
    })),
  }

  return (
    <>
      <JsonLd data={[breadcrumbSchema, itemListSchema]} />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/providers" className="hover:text-white">Providers</Link>
            <span className="mx-2">/</span>
            <Link href="/providers/frontier-fiber" className="hover:text-white">Frontier Fiber</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Availability</span>
          </nav>

          {/* Header */}
          <div className="flex items-center gap-6 mb-8">
            <ProviderLogo slug="frontier-fiber" name="Frontier Fiber" size="lg" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Frontier Fiber Availability
              </h1>
              <p className="text-gray-400 text-lg">
                {cities.length} cities with Frontier Fiber coverage
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{cities.length}</div>
              <div className="text-sm text-gray-400">Cities</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{stateOrder.length}</div>
              <div className="text-sm text-gray-400">States</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">
                {cities.length > 0 ? Math.round(cities.reduce((sum, c) => sum + c.coverage_pct, 0) / cities.length) : 0}%
              </div>
              <div className="text-sm text-gray-400">Avg Coverage</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">
                {cities.filter(c => c.coverage_pct >= 50).length}
              </div>
              <div className="text-sm text-gray-400">50%+ Coverage</div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-800/50 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">Check Frontier Fiber at Your Address</h2>
                <p className="text-gray-400">Enter your ZIP code to see exact availability and plans</p>
              </div>
              <Link
                href="/providers/frontier-fiber"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                Check Availability
              </Link>
            </div>
          </div>

          {/* Top Cities by Coverage */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Top Cities by Frontier Coverage</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cities.slice(0, 12).map((city) => (
                <Link
                  key={`${city.state_slug}-${city.city_slug}`}
                  href={`/internet/${city.state_slug}/${city.city_slug}`}
                  className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-red-600/50 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold group-hover:text-red-400 transition-colors">
                      {city.city_name}, {city.state_abbr}
                    </h3>
                    <span className="text-sm font-medium text-red-400">
                      {Math.round(city.coverage_pct)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                        style={{ width: `${Math.min(city.coverage_pct, 100)}%` }}
                      />
                    </div>
                    {city.fiber_pct && (
                      <span className="text-xs text-gray-500">
                        {Math.round(city.fiber_pct)}% fiber
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* All Cities by State */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">All Frontier Fiber Cities by State</h2>
            <div className="space-y-6">
              {stateOrder.map((stateAbbr) => (
                <div key={stateAbbr} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-red-400">
                    {stateAbbr} ({groupedCities[stateAbbr].length} {groupedCities[stateAbbr].length === 1 ? 'city' : 'cities'})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {groupedCities[stateAbbr]
                      .sort((a, b) => b.coverage_pct - a.coverage_pct)
                      .map((city) => (
                        <Link
                          key={`${city.state_slug}-${city.city_slug}`}
                          href={`/internet/${city.state_slug}/${city.city_slug}`}
                          className="flex items-center justify-between p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          <span className="truncate mr-2">{city.city_name}</span>
                          <span className="text-red-400 font-medium whitespace-nowrap">
                            {Math.round(city.coverage_pct)}%
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclosure */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-500">
              Coverage data from FCC Broadband Data Collection (BDC). Actual availability varies by address.
              <br />
              Coverage percentages represent estimated availability within each metropolitan area (CBSA).
            </p>
          </div>

          {/* Back to Provider */}
          <div className="mt-8 text-center">
            <Link
              href="/providers/frontier-fiber"
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Frontier Fiber Overview
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
