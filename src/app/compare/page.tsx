import { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { ZipSearch } from '@/components/ZipSearch'
import { getProviderSlug, cleanProviderName } from '@/lib/providers'
import { RelatedRankings } from '@/components/RelatedRankings'
import { JsonLd, generateBreadcrumbSchema } from '@/lib/seo'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ zip?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const zipCode = params.zip

  if (zipCode) {
    // Check if we have data for this ZIP
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('zip_broadband_coverage')
      .select('city')
      .eq('zip_code', zipCode)
      .single()

    if (data?.city) {
      return {
        title: `Internet Providers in ${data.city} (${zipCode})`,
        description: `Compare internet providers in ${data.city}, ${zipCode}. See available fiber, cable, and wireless options with coverage percentages.`,
        alternates: {
          canonical: `/compare?zip=${zipCode}`,
        },
      }
    } else {
      // Soft 404 - ZIP not found, add noindex
      return {
        title: `Internet Providers - ZIP ${zipCode}`,
        description: `Search for internet providers in your area.`,
        robots: {
          index: false,
          follow: true,
        },
      }
    }
  }

  return {
    title: 'Compare Internet Providers',
    description: 'Compare internet providers in your area. Enter your ZIP code to see available options, speeds, and coverage.',
    alternates: {
      canonical: '/compare',
    },
  }
}

interface CoverageData {
  zipCode: string
  city: string | null
  totalHousingUnits: number
  coverage: {
    anyTechnology: { speed25_3: number | null; speed100_20: number | null; speed1000_100: number | null }
    fiber: { speed25_3: number | null; speed100_20: number | null; speed1000_100: number | null }
    cable: { speed25_3: number | null; speed100_20: number | null; speed1000_100: number | null }
    fixedWireless: { speed25_3: number | null; speed100_20: number | null }
  }
  dataSource: string
}

interface Provider {
  name: string
  coverage: number
}

async function getCoverageByZip(zipCode: string): Promise<CoverageData | null> {
  if (!zipCode || !/^\d{5}$/.test(zipCode)) {
    return null
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('zip_broadband_coverage')
    .select('*')
    .eq('zip_code', zipCode)
    .single()

  if (error || !data) {
    return null
  }

  const formatPercent = (val: number | null) =>
    val !== null ? Math.round(val * 100) : null

  return {
    zipCode: data.zip_code,
    city: data.city,
    totalHousingUnits: data.total_housing_units,
    coverage: {
      anyTechnology: {
        speed25_3: formatPercent(data.any_25_3),
        speed100_20: formatPercent(data.any_100_20),
        speed1000_100: formatPercent(data.any_1000_100),
      },
      fiber: {
        speed25_3: formatPercent(data.fiber_25_3),
        speed100_20: formatPercent(data.fiber_100_20),
        speed1000_100: formatPercent(data.fiber_1000_100),
      },
      cable: {
        speed25_3: formatPercent(data.cable_25_3),
        speed100_20: formatPercent(data.cable_100_20),
        speed1000_100: formatPercent(data.cable_1000_100),
      },
      fixedWireless: {
        speed25_3: formatPercent(data.fixed_wireless_25_3),
        speed100_20: formatPercent(data.fixed_wireless_100_20),
      },
    },
    dataSource: data.data_source,
  }
}

async function getProvidersByZip(zipCode: string): Promise<Provider[]> {
  if (!zipCode || !/^\d{5}$/.test(zipCode)) {
    return []
  }

  const supabase = createAdminClient()

  // Step 1: Get CBSA code for this ZIP
  const { data: zipData, error: zipError } = await supabase
    .from('zip_cbsa_mapping')
    .select('cbsa_code')
    .eq('zip_code', zipCode)
    .single()

  if (zipError || !zipData) {
    return []
  }

  // Step 2: Get providers for this CBSA
  const { data: cbsaData, error: cbsaError } = await supabase
    .from('cbsa_providers')
    .select('provider_id, coverage_pct')
    .eq('cbsa_code', zipData.cbsa_code)
    .order('coverage_pct', { ascending: false })
    .limit(10)

  if (cbsaError || !cbsaData || cbsaData.length === 0) {
    return []
  }

  // Step 3: Get provider names
  const providerIds = cbsaData.map((p: any) => p.provider_id)
  const { data: providerNames, error: namesError } = await supabase
    .from('fcc_providers')
    .select('provider_id, name')
    .in('provider_id', providerIds)

  if (namesError || !providerNames) {
    return []
  }

  // Create lookup map for names
  const nameMap = new Map(providerNames.map((p: any) => [p.provider_id, p.name]))

  // Combine and format
  const providers: Provider[] = cbsaData
    .map((cp: any) => ({
      name: nameMap.get(cp.provider_id) || 'Unknown Provider',
      coverage: Math.round(cp.coverage_pct * 100),
    }))
    .filter((p: Provider) => p.name !== 'Unknown Provider')

  return providers
}

function CoverageBar({ percent, color }: { percent: number | null; color: string }) {
  if (percent === null) return <span className="text-gray-500">N/A</span>
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-sm font-medium w-12 text-right">{percent}%</span>
    </div>
  )
}

function TechnologyCard({
  title,
  icon,
  coverage,
  color,
}: {
  title: string
  icon: React.ReactNode
  coverage: { speed25_3: number | null; speed100_20: number | null; speed1000_100?: number | null }
  color: string
}) {
  return (
    <div className="p-6 futuristic-card rounded-xl corner-accent glow-burst-hover">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Basic (25/3 Mbps)</span>
          </div>
          <CoverageBar percent={coverage.speed25_3} color={color} />
        </div>
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Fast (100/20 Mbps)</span>
          </div>
          <CoverageBar percent={coverage.speed100_20} color={color} />
        </div>
        {coverage.speed1000_100 !== undefined && (
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Gigabit (1000/100 Mbps)</span>
            </div>
            <CoverageBar percent={coverage.speed1000_100} color={color} />
          </div>
        )}
      </div>
    </div>
  )
}

function ProviderCard({ provider }: { provider: Provider }) {
  // Determine provider type based on name
  const isSatellite = provider.name.toLowerCase().includes('echostar') ||
    provider.name.toLowerCase().includes('viasat') ||
    provider.name.toLowerCase().includes('space exploration') ||
    provider.name.toLowerCase().includes('starlink')

  const isFiber = provider.name.toLowerCase().includes('at&t') ||
    provider.name.toLowerCase().includes('verizon') ||
    provider.name.toLowerCase().includes('frontier') ||
    provider.name.toLowerCase().includes('centurylink') ||
    provider.name.toLowerCase().includes('google fiber')

  const isCable = provider.name.toLowerCase().includes('charter') ||
    provider.name.toLowerCase().includes('comcast') ||
    provider.name.toLowerCase().includes('xfinity') ||
    provider.name.toLowerCase().includes('cox') ||
    provider.name.toLowerCase().includes('altice') ||
    provider.name.toLowerCase().includes('spectrum')

  let type = 'Internet Provider'
  let color = 'text-gray-400'

  if (isSatellite) {
    type = 'Satellite'
    color = 'text-orange-400'
  } else if (isFiber) {
    type = 'Fiber/DSL'
    color = 'text-purple-400'
  } else if (isCable) {
    type = 'Cable'
    color = 'text-blue-400'
  }

  // Clean up provider name and get slug
  const displayName = cleanProviderName(provider.name)
  const slug = getProviderSlug(provider.name)

  const content = (
    <div className="flex items-center justify-between p-4 futuristic-card rounded-lg group glow-burst-hover">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
          <span className={`text-xl font-bold ${slug ? 'text-gray-500 group-hover:text-blue-400 transition-colors' : 'text-gray-500'}`}>
            {displayName.charAt(0)}
          </span>
        </div>
        <div>
          <h4 className={`font-semibold ${slug ? 'group-hover:text-blue-400 transition-colors' : ''}`}>{displayName}</h4>
          <p className={`text-sm ${color}`}>{type}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-semibold">{provider.coverage}%</div>
        <p className="text-xs text-gray-500">area coverage</p>
      </div>
    </div>
  )

  if (slug) {
    return <Link href={`/providers/${slug}`}>{content}</Link>
  }

  return content
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ zip?: string }>
}) {
  const params = await searchParams
  const zipCode = params.zip || ''

  const [result, providers] = await Promise.all([
    getCoverageByZip(zipCode),
    getProvidersByZip(zipCode),
  ])

  // Generate breadcrumb schema
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Compare Providers', url: '/compare' },
  ]
  if (zipCode && result) {
    breadcrumbItems.push({
      name: result.city || `ZIP ${zipCode}`,
      url: `/compare?zip=${zipCode}`,
    })
  }

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(breadcrumbItems)} />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text-ocean">
            {zipCode ? `Internet Providers in ${zipCode}` : 'Find Internet Providers'}
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            {zipCode
              ? `Compare providers and coverage in your area`
              : `Enter your ZIP code to see available providers`}
          </p>

          {/* Only show full search when no ZIP, otherwise show compact change option */}
          {!zipCode ? (
            <ZipSearch />
          ) : (
            <a
              href="/compare"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search different ZIP code
            </a>
          )}
        </div>

        {/* Results */}
        {(result || providers.length > 0) && (
          <div className="mt-12">
            {/* Location Info */}
            {result && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-800/50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{result.city || `ZIP ${result.zipCode}`}</h2>
                    <p className="text-gray-400">ZIP Code: {result.zipCode}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-400">
                      {result.coverage.anyTechnology.speed100_20}%
                    </div>
                    <p className="text-sm text-gray-400">have 100+ Mbps access</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap gap-6 text-sm text-gray-400">
                  <span>{result.totalHousingUnits.toLocaleString()} housing units</span>
                  <span>Source: {result.dataSource}</span>
                </div>
              </div>
            )}

            {/* Providers Section */}
            {providers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">
                  Available Providers ({providers.length})
                </h3>
                <div className="grid gap-3">
                  {providers.map((provider, idx) => (
                    <ProviderCard key={idx} provider={provider} />
                  ))}
                </div>
              </div>
            )}

            {/* Coverage by Technology */}
            {result && (
              <>
                <h3 className="text-xl font-semibold mb-4">Coverage by Technology</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <TechnologyCard
                    title="Fiber"
                    icon={
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                    coverage={result.coverage.fiber}
                    color="bg-purple-500"
                  />
                  <TechnologyCard
                    title="Cable"
                    icon={
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                    coverage={result.coverage.cable}
                    color="bg-blue-500"
                  />
                  <TechnologyCard
                    title="Fixed Wireless"
                    icon={
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                    }
                    coverage={result.coverage.fixedWireless}
                    color="bg-green-500"
                  />
                  <TechnologyCard
                    title="Any Technology"
                    icon={
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    coverage={result.coverage.anyTechnology}
                    color="bg-yellow-500"
                  />
                </div>

                {/* Speed Tiers Explanation */}
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 text-sm text-gray-400">
                  <p className="font-medium text-gray-300 mb-2">Speed Tiers Explained:</p>
                  <ul className="space-y-1">
                    <li><strong>Basic (25/3 Mbps):</strong> Minimum for video streaming and basic work</li>
                    <li><strong>Fast (100/20 Mbps):</strong> Good for multiple devices, HD streaming, video calls</li>
                    <li><strong>Gigabit (1000/100 Mbps):</strong> Best for heavy usage, 4K streaming, large downloads</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {/* No data found */}
        {zipCode && !result && providers.length === 0 && (
          <div className="mt-12 text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No Data Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We don't have coverage data for ZIP code {zipCode}.
              Try a nearby ZIP code or check back later.
            </p>
          </div>
        )}

        {/* No search yet */}
        {!zipCode && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 futuristic-card rounded-xl corner-accent glow-burst-hover">
              <div className="text-3xl mb-3 gradient-text-fresh">1</div>
              <h3 className="font-semibold mb-2">Enter Your ZIP</h3>
              <p className="text-sm text-gray-400">Type your 5-digit ZIP code to start</p>
            </div>
            <div className="p-6 futuristic-card rounded-xl corner-accent glow-burst-hover">
              <div className="text-3xl mb-3 gradient-text-ocean">2</div>
              <h3 className="font-semibold mb-2">See Providers</h3>
              <p className="text-sm text-gray-400">View all available internet providers</p>
            </div>
            <div className="p-6 futuristic-card rounded-xl corner-accent glow-burst-hover">
              <div className="text-3xl mb-3 gradient-text-sunset">3</div>
              <h3 className="font-semibold mb-2">Compare Coverage</h3>
              <p className="text-sm text-gray-400">Check speeds and technology availability</p>
            </div>
          </div>
        )}

        {/* Related Rankings */}
        <div className="mt-12">
          <RelatedRankings title="Explore Internet Rankings" />
        </div>
        </div>
      </div>
    </>
  )
}
