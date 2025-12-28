import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { states } from '@/data/states'
import { ZipSearch } from '@/components/ZipSearch'
import { ProviderLink } from '@/components/ProviderLink'
import { ProviderLogo } from '@/components/ProviderLogo'
import { RelatedRankings } from '@/components/RelatedRankings'
import { cleanProviderName, getProviderSlug } from '@/lib/providers'
import {
  JsonLd,
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
} from '@/lib/seo'

interface Props {
  params: Promise<{ state: string; city: string }>
}

// Helper to create slug from city name
function cityToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Helper to get city info from state and city slug
function getCityInfo(stateSlug: string, citySlug: string) {
  const stateInfo = states[stateSlug.toLowerCase()]
  if (!stateInfo) return null

  const city = stateInfo.topCities.find(c => cityToSlug(c.name) === citySlug.toLowerCase())
  if (!city) return null

  return { stateInfo, city }
}

async function getCoverageData(zipCode: string) {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('zip_broadband_coverage')
    .select('*')
    .eq('zip_code', zipCode)
    .single()

  if (!data) return null

  return {
    totalHousingUnits: data.total_housing_units,
    fiberCoverage: data.fiber_100_20 ? Math.round(data.fiber_100_20 * 100) : null,
    cableCoverage: data.cable_100_20 ? Math.round(data.cable_100_20 * 100) : null,
    anyCoverage: data.any_100_20 ? Math.round(data.any_100_20 * 100) : null,
  }
}

async function getProviders(zipCode: string) {
  const supabase = createAdminClient()

  // Get CBSA for this ZIP
  const { data: zipData } = await supabase
    .from('zip_cbsa_mapping')
    .select('cbsa_code')
    .eq('zip_code', zipCode)
    .single()

  if (!zipData?.cbsa_code) return []

  // Get providers for this CBSA
  const { data: cbsaProviders } = await supabase
    .from('cbsa_providers')
    .select(`
      coverage_pct,
      fcc_providers (
        provider_id,
        name
      )
    `)
    .eq('cbsa_code', zipData.cbsa_code)
    .order('coverage_pct', { ascending: false })
    .limit(20)

  if (!cbsaProviders) return []

  return cbsaProviders
    .filter((cp) => {
      const provider = Array.isArray(cp.fcc_providers) ? cp.fcc_providers[0] : cp.fcc_providers
      return provider?.name
    })
    .map((cp) => {
      const provider = Array.isArray(cp.fcc_providers) ? cp.fcc_providers[0] : cp.fcc_providers
      return {
        name: provider!.name,
        coverage: Math.round(cp.coverage_pct * 100),
      }
    })
}

function getProviderType(name: string): { type: string; color: string } {
  const lowerName = name.toLowerCase()

  if (lowerName.includes('viasat') || lowerName.includes('echostar') || lowerName.includes('starlink') || lowerName.includes('space exploration')) {
    return { type: 'Satellite', color: 'text-orange-400' }
  }
  if (lowerName.includes('at&t') || lowerName.includes('verizon') || lowerName.includes('frontier') || lowerName.includes('centurylink') || lowerName.includes('lumen')) {
    return { type: 'Fiber/DSL', color: 'text-purple-400' }
  }
  if (lowerName.includes('charter') || lowerName.includes('comcast') || lowerName.includes('xfinity') || lowerName.includes('cox') || lowerName.includes('spectrum') || lowerName.includes('altice')) {
    return { type: 'Cable', color: 'text-blue-400' }
  }
  if (lowerName.includes('t-mobile') || lowerName.includes('verizon wireless')) {
    return { type: '5G/Wireless', color: 'text-green-400' }
  }
  return { type: 'Internet', color: 'text-gray-400' }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, city } = await params
  const info = getCityInfo(state, city)

  if (!info) {
    return { title: 'City Not Found' }
  }

  const citySlug = cityToSlug(info.city.name)

  return {
    title: `Internet Providers in ${info.city.name}, ${info.stateInfo.code} | Compare ISPs`,
    description: `Compare internet providers in ${info.city.name}, ${info.stateInfo.name}. Find the best fiber, cable, and wireless internet options. Check speeds, prices, and availability.`,
    alternates: {
      canonical: `/internet/${state}/${citySlug}`,
    },
    openGraph: {
      title: `Internet Providers in ${info.city.name}, ${info.stateInfo.code}`,
      description: `Compare internet providers in ${info.city.name}, ${info.stateInfo.name}. Find the best fiber, cable, and wireless options.`,
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
  const { state, city } = await params
  const info = getCityInfo(state, city)

  if (!info) {
    notFound()
  }

  const { stateInfo, city: cityInfo } = info
  const citySlug = cityToSlug(cityInfo.name)
  const [coverage, providers] = await Promise.all([
    getCoverageData(cityInfo.zip),
    getProviders(cityInfo.zip),
  ])

  // Categorize providers
  const fiberProviders = providers.filter(p => getProviderType(p.name).type === 'Fiber/DSL')
  const cableProviders = providers.filter(p => getProviderType(p.name).type === 'Cable')
  const wirelessProviders = providers.filter(p => ['5G/Wireless', 'Satellite'].includes(getProviderType(p.name).type))

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Internet by State', url: '/internet' },
    { name: stateInfo.name, url: `/internet/${state}` },
    { name: cityInfo.name, url: `/internet/${state}/${citySlug}` },
  ])

  const localBusinessSchema = generateLocalBusinessSchema({
    city: cityInfo.name,
    state: state,
    stateName: stateInfo.name,
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
            <Link href={`/internet/${state}`} className="hover:text-white">{stateInfo.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{cityInfo.name}</span>
          </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            {stateInfo.code} • ZIP {cityInfo.zip}
          </span>
          <h1 className="text-4xl font-bold mb-4">
            Internet Providers in {cityInfo.name}, {stateInfo.code}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Compare the best internet service providers in {cityInfo.name}. Find fiber, cable, and wireless options.
          </p>
          <ZipSearch defaultZip={cityInfo.zip} />
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
            <h2 className="text-2xl font-semibold mb-6">Providers in {cityInfo.name}</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Fiber/DSL */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="font-semibold">Fiber & DSL</h3>
                </div>
                <ul className="space-y-2">
                  {fiberProviders.slice(0, 5).map((p, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <ProviderLink name={p.name} className="text-gray-300" />
                      <span className="text-purple-400">{p.coverage}%</span>
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
                      <ProviderLink name={p.name} className="text-gray-300" />
                      <span className="text-blue-400">{p.coverage}%</span>
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
                      <ProviderLink name={p.name} className="text-gray-300" />
                      <span className="text-green-400">{p.coverage}%</span>
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
                const { type, color } = getProviderType(provider.name)
                const displayName = cleanProviderName(provider.name)
                const slug = getProviderSlug(provider.name)

                const cardContent = (
                  <>
                    <div className="flex items-center gap-3">
                      <ProviderLogo slug={slug || ''} name={displayName} size="sm" />
                      <div>
                        <div className={`font-medium ${slug ? 'group-hover:text-blue-400 transition-colors' : ''}`}>
                          {displayName}
                        </div>
                        <div className={`text-xs ${color}`}>{type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{provider.coverage}%</div>
                      <div className="text-xs text-gray-500">coverage</div>
                    </div>
                  </>
                )

                return slug ? (
                  <Link
                    key={i}
                    href={`/providers/${slug}`}
                    className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-blue-600/50 transition-colors group"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg"
                  >
                    {cardContent}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {providers.length === 0 && (
          <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800 mb-12">
            <p className="text-gray-400">No provider data available for this area. Try searching with a specific ZIP code.</p>
          </div>
        )}

        {/* Related Rankings */}
        <RelatedRankings title={`Internet Rankings for ${cityInfo.name}`} />

        {/* Other Cities in State */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-center">Other Cities in {stateInfo.name}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {stateInfo.topCities
              .filter(c => cityToSlug(c.name) !== city)
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
              View All {stateInfo.name}
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Check Your Exact Address</h2>
          <p className="text-gray-400 mb-6">Enter your ZIP code to see the best options for your specific location</p>
          <Link
            href={`/compare?zip=${cityInfo.zip}`}
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
