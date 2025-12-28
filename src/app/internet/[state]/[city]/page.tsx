import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { states } from '@/data/states'
import { ZipSearch } from '@/components/ZipSearch'
import { ProviderLogo } from '@/components/ProviderLogo'
import { RelatedRankings } from '@/components/RelatedRankings'
import {
  getCityData,
  getCityAvailability,
  getCityProviders,
  categorizeProvider,
  CityProvider,
} from '@/lib/getCityData'
import {
  JsonLd,
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
} from '@/lib/seo'

interface Props {
  params: Promise<{ state: string; city: string }>
}

// Helper to create slug from city name (for fallback compatibility)
function cityToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Fallback to get city info from states.ts when not in city_definitions
function getCityInfoFallback(stateSlug: string, citySlug: string) {
  const stateInfo = states[stateSlug.toLowerCase()]
  if (!stateInfo) return null

  const city = stateInfo.topCities.find(c => cityToSlug(c.name) === citySlug.toLowerCase())
  if (!city) return null

  return { stateInfo, city }
}

// Get provider category info from CityProvider
function getProviderCategoryInfo(provider: CityProvider): { type: string; color: string } {
  const category = categorizeProvider(provider)

  switch (category) {
    case 'fiber':
      return { type: 'Fiber', color: 'text-purple-400' }
    case 'cable':
      return { type: 'Cable', color: 'text-blue-400' }
    case 'wireless':
      return { type: '5G/Wireless', color: 'text-green-400' }
    default:
      return { type: 'Internet', color: 'text-gray-400' }
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, city: citySlug } = await params

  // Try database first, fallback to states.ts
  const cityData = await getCityData(state, citySlug)
  const fallbackInfo = getCityInfoFallback(state, citySlug)

  const cityName = cityData?.city.city_name || fallbackInfo?.city.name
  const stateAbbr = cityData?.city.state_abbr || fallbackInfo?.stateInfo.code
  const stateName = fallbackInfo?.stateInfo.name || state.toUpperCase()

  if (!cityName) {
    return { title: 'City Not Found' }
  }

  return {
    title: `Internet Providers in ${cityName}, ${stateAbbr} | Compare ISPs`,
    description: `Compare internet providers in ${cityName}, ${stateName}. Find the best fiber, cable, and wireless internet options. Check speeds, prices, and availability.`,
    alternates: {
      canonical: `/internet/${state}/${citySlug}`,
    },
    openGraph: {
      title: `Internet Providers in ${cityName}, ${stateAbbr}`,
      description: `Compare internet providers in ${cityName}, ${stateName}. Find the best fiber, cable, and wireless options.`,
      url: `/internet/${state}/${citySlug}`,
    },
  }
}

export async function generateStaticParams() {
  const params: { state: string; city: string }[] = []

  Object.entries(states).forEach(([stateSlug, stateInfo]) => {
    stateInfo.topCities.forEach(city => {
      params.push({
        state: stateSlug,
        city: cityToSlug(city.name),
      })
    })
  })

  return params
}

export default async function CityPage({ params }: Props) {
  const { state, city: citySlugParam } = await params

  // Try database first for deterministic city data
  const cityData = await getCityData(state, citySlugParam)

  // Fallback to states.ts if not in database
  const fallbackInfo = getCityInfoFallback(state, citySlugParam)

  if (!cityData && !fallbackInfo) {
    notFound()
  }

  // Use database values with fallback
  const cityName = cityData?.city.city_name || fallbackInfo?.city.name || ''
  const stateAbbr = cityData?.city.state_abbr || fallbackInfo?.stateInfo.code || state.toUpperCase()
  const stateName = fallbackInfo?.stateInfo.name || state.toUpperCase()
  const representativeZip = cityData?.city.representative_zip || fallbackInfo?.city.zip || ''

  // Coverage from new view (or null if not available)
  const coverage = cityData?.availability ? {
    fiberCoverage: cityData.availability.fiberCoverage,
    cableCoverage: cityData.availability.cableCoverage,
    fixedWirelessCoverage: cityData.availability.fixedWirelessCoverage,
    anyCoverage: cityData.availability.anyCoverage,
  } : null

  // Providers from deterministic cbsa_top_providers_v1 view
  const providers = cityData?.providers || []

  // Categorize providers by technology
  const fiberProviders = providers.filter(p => categorizeProvider(p) === 'fiber')
  const cableProviders = providers.filter(p => categorizeProvider(p) === 'cable')
  const wirelessProviders = providers.filter(p => categorizeProvider(p) === 'wireless')

  // Get stateInfo from fallback for "Other Cities" section
  const stateInfo = fallbackInfo?.stateInfo || { name: stateName, code: stateAbbr, topCities: [] }

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Internet by State', url: '/internet' },
    { name: stateName, url: `/internet/${state}` },
    { name: cityName, url: `/internet/${state}/${citySlugParam}` },
  ])

  const localBusinessSchema = generateLocalBusinessSchema({
    city: cityName,
    state: state,
    stateName: stateName,
  })

  return (
    <>
      <JsonLd data={[breadcrumbSchema, localBusinessSchema]} />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/internet" className="hover:text-white">Internet by State</Link>
            <span className="mx-2">/</span>
            <Link href={`/internet/${state}`} className="hover:text-white">{stateName}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{cityName}</span>
          </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            {stateAbbr} • ZIP {representativeZip}
          </span>
          <h1 className="text-4xl font-bold mb-4">
            Internet Providers in {cityName}, {stateAbbr}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Compare the best internet service providers in {cityName}. Find fiber, cable, and wireless options.
          </p>
          <ZipSearch defaultZip={representativeZip} />
        </div>

        {/* Coverage Stats */}
        {coverage && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{providers.length}</div>
              <div className="text-sm text-gray-400">Providers</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{coverage.fiberCoverage ?? 'N/A'}%</div>
              <div className="text-sm text-gray-400">Fiber Coverage</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">{coverage.cableCoverage ?? 'N/A'}%</div>
              <div className="text-sm text-gray-400">Cable Coverage</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{coverage.anyCoverage ?? 'N/A'}%</div>
              <div className="text-sm text-gray-400">100+ Mbps Coverage</div>
            </div>
          </div>
        )}

        {/* Providers by Type */}
        {providers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Providers in {cityName}</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Fiber */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="font-semibold">Fiber</h3>
                </div>
                <ul className="space-y-2">
                  {fiberProviders.slice(0, 5).map((p, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <Link href={`/providers/${p.providerSlug}`} className="text-gray-300 hover:text-purple-400 transition-colors">
                        {p.providerName}
                      </Link>
                      <span className="text-purple-400">{p.coveragePct}%</span>
                    </li>
                  ))}
                  {fiberProviders.length === 0 && (
                    <li className="text-sm text-gray-500">Limited availability</li>
                  )}
                </ul>
              </div>

              {/* Cable */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-semibold">Cable</h3>
                </div>
                <ul className="space-y-2">
                  {cableProviders.slice(0, 5).map((p, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <Link href={`/providers/${p.providerSlug}`} className="text-gray-300 hover:text-blue-400 transition-colors">
                        {p.providerName}
                      </Link>
                      <span className="text-blue-400">{p.coveragePct}%</span>
                    </li>
                  ))}
                  {cableProviders.length === 0 && (
                    <li className="text-sm text-gray-500">Limited availability</li>
                  )}
                </ul>
              </div>

              {/* Wireless/Satellite */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                  <h3 className="font-semibold">5G & Satellite</h3>
                </div>
                <ul className="space-y-2">
                  {wirelessProviders.slice(0, 5).map((p, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <Link href={`/providers/${p.providerSlug}`} className="text-gray-300 hover:text-green-400 transition-colors">
                        {p.providerName}
                      </Link>
                      <span className="text-green-400">{p.coveragePct}%</span>
                    </li>
                  ))}
                  {wirelessProviders.length === 0 && (
                    <li className="text-sm text-gray-500">Limited availability</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* All Providers List */}
        {providers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">All {providers.length} Providers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider, i) => {
                const { type, color } = getProviderCategoryInfo(provider)

                return (
                  <Link
                    key={i}
                    href={`/providers/${provider.providerSlug}`}
                    className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-blue-600/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <ProviderLogo slug={provider.providerSlug} name={provider.providerName} size="sm" />
                      <div>
                        <div className="font-medium group-hover:text-blue-400 transition-colors">
                          {provider.providerName}
                        </div>
                        <div className={`text-xs ${color}`}>{type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{provider.coveragePct}%</div>
                      <div className="text-xs text-gray-500">coverage</div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* FCC BDC Disclosure */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              Coverage data from FCC Broadband Data Collection (BDC). Actual availability varies by address.
            </p>
          </div>
        )}

        {providers.length === 0 && (
          <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800 mb-12">
            <p className="text-gray-400">No provider data available for this area. Try searching with a specific ZIP code.</p>
          </div>
        )}

        {/* Frontier Fiber Module - shown when Frontier is in provider list */}
        {providers.some(p => p.providerSlug === 'frontier-fiber') && (
          <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-800/30 rounded-xl p-6 mb-12">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ProviderLogo slug="frontier-fiber" name="Frontier Fiber" size="lg" />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold mb-1">Frontier Fiber in {cityName}</h3>
                <p className="text-gray-400 text-sm">
                  Frontier Fiber offers high-speed fiber internet in {cityName}. Check availability at your address.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/providers/frontier-fiber?source=frontier-city&loc=${state}-${citySlugParam}`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Learn More
                </Link>
                <Link
                  href={`/go/frontier-fiber?source=frontier-city&campaign=frontier_cbsa_ge20&loc=${state}-${citySlugParam}`}
                  className="px-4 py-2 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Check Availability
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Related Rankings */}
        <RelatedRankings title={`Internet Rankings for ${cityName}`} />

        {/* Other Cities in State */}
        {stateInfo.topCities && stateInfo.topCities.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Other Cities in {stateName}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {stateInfo.topCities
                .filter(c => cityToSlug(c.name) !== citySlugParam)
                .map(c => (
                  <Link
                    key={c.zip}
                    href={`/internet/${state}/${cityToSlug(c.name)}`}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              <Link
                href={`/internet/${state}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All {stateName}
              </Link>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Check Your Exact Address</h2>
          <p className="text-gray-400 mb-6">Enter your ZIP code to see the best options for your specific location</p>
          <Link
            href={`/compare?zip=${representativeZip}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Compare Providers
          </Link>
        </div>
        </div>
      </div>
    </>
  )
}
