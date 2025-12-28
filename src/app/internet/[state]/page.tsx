import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { states, stateList } from '@/data/states'
import { ZipSearch } from '@/components/ZipSearch'
import { ProviderLink } from '@/components/ProviderLink'
import { ProviderLogo } from '@/components/ProviderLogo'
import { RelatedRankings } from '@/components/RelatedRankings'
import { cleanProviderName, getProviderSlug } from '@/lib/providers'

interface Props {
  params: Promise<{ state: string }>
}

// TODO: Use stateCode to filter ZIP codes by state
async function getStateProviders(_stateCode: string) {
  const supabase = createAdminClient()

  // Get a sample of ZIP codes for this state to find providers
  // We'll use the first digit patterns that correspond to states
  const { data: zipMappings, error } = await supabase
    .from('zip_cbsa_mapping')
    .select('cbsa_code')
    .limit(100)

  if (error || !zipMappings) {
    return { providers: [], coverageStats: null }
  }

  // Get unique CBSA codes
  const cbsaCodes = [...new Set(zipMappings.map(z => z.cbsa_code))]

  if (cbsaCodes.length === 0) {
    return { providers: [], coverageStats: null }
  }

  // Get providers for these CBSAs
  const { data: cbsaProviders } = await supabase
    .from('cbsa_providers')
    .select(`
      coverage_pct,
      fcc_providers (
        provider_id,
        name
      )
    `)
    .in('cbsa_code', cbsaCodes.slice(0, 20))
    .order('coverage_pct', { ascending: false })
    .limit(50)

  if (!cbsaProviders) {
    return { providers: [], coverageStats: null }
  }

  // Aggregate providers and their coverage
  const providerMap = new Map<string, { name: string; totalCoverage: number; count: number }>()

  cbsaProviders.forEach((cp) => {
    const provider = Array.isArray(cp.fcc_providers) ? cp.fcc_providers[0] : cp.fcc_providers
    const name = provider?.name
    if (!name) return

    const existing = providerMap.get(name)
    if (existing) {
      existing.totalCoverage += cp.coverage_pct
      existing.count++
    } else {
      providerMap.set(name, {
        name,
        totalCoverage: cp.coverage_pct,
        count: 1,
      })
    }
  })

  // Convert to array and sort by average coverage
  const providers = Array.from(providerMap.values())
    .map(p => ({
      name: p.name,
      avgCoverage: Math.round((p.totalCoverage / p.count) * 100),
    }))
    .sort((a, b) => b.avgCoverage - a.avgCoverage)
    .slice(0, 15)

  return { providers, coverageStats: null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params
  const stateInfo = states[state.toLowerCase()]

  if (!stateInfo) {
    return { title: 'State Not Found' }
  }

  return {
    title: `Internet Providers in ${stateInfo.name} | Compare ${stateInfo.code} ISPs`,
    description: `Find and compare the best internet providers in ${stateInfo.name}. Compare fiber, cable, and 5G plans. Check availability in ${stateInfo.topCities[0]?.name}, ${stateInfo.topCities[1]?.name}, and more.`,
  }
}

export async function generateStaticParams() {
  return stateList.map((state) => ({
    state: state.slug,
  }))
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

// cleanProviderName imported from @/lib/providers

// Helper to create URL slug from city name
function cityToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default async function StatePage({ params }: Props) {
  const { state } = await params
  const stateInfo = states[state.toLowerCase()]

  if (!stateInfo) {
    notFound()
  }

  const { providers } = await getStateProviders(stateInfo.code)

  // Categorize providers
  const fiberProviders = providers.filter(p => {
    const type = getProviderType(p.name).type
    return type === 'Fiber/DSL'
  })
  const cableProviders = providers.filter(p => {
    const type = getProviderType(p.name).type
    return type === 'Cable'
  })
  const wirelessProviders = providers.filter(p => {
    const type = getProviderType(p.name).type
    return type === '5G/Wireless' || type === 'Satellite'
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/internet" className="hover:text-white">Internet by State</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{stateInfo.name}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Internet Providers in {stateInfo.name}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Compare the best internet service providers available in {stateInfo.name}.
            Find fiber, cable, and wireless options near you.
          </p>
          <ZipSearch />
        </div>

        {/* Top Cities */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Popular Cities in {stateInfo.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stateInfo.topCities.map((city) => (
              <Link
                key={city.zip}
                href={`/internet/${state}/${cityToSlug(city.name)}`}
                className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-600/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-sm text-gray-500">ZIP: {city.zip}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Providers by Type */}
        {providers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Top Providers in {stateInfo.name}</h2>

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
                      <span className="text-purple-400">{p.avgCoverage}%</span>
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
                      <span className="text-blue-400">{p.avgCoverage}%</span>
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
                      <span className="text-green-400">{p.avgCoverage}%</span>
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
            <h2 className="text-2xl font-semibold mb-6">All Providers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider, i) => {
                const { type, color } = getProviderType(provider.name)
                const slug = getProviderSlug(provider.name)
                const displayName = cleanProviderName(provider.name)

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
                      <div className="font-semibold">{provider.avgCoverage}%</div>
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

        {/* Related Rankings */}
        <RelatedRankings title={`Internet Rankings for ${stateInfo.name}`} />

        {/* Browse Other States */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">Browse Other States</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {stateList
              .filter(s => s.slug !== state.toLowerCase())
              .slice(0, 20)
              .map((s) => (
                <Link
                  key={s.slug}
                  href={`/internet/${s.slug}`}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm hover:bg-gray-700 hover:text-white transition-colors"
                >
                  {s.code}
                </Link>
              ))}
            <Link
              href="/internet"
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
