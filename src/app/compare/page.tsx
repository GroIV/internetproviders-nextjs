import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { ZipSearch } from '@/components/ZipSearch'

export const metadata: Metadata = {
  title: 'Compare Internet Providers',
  description: 'Compare internet providers in your area. Enter your ZIP code to see available options, speeds, and coverage.',
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
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
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

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ zip?: string }>
}) {
  const params = await searchParams
  const zipCode = params.zip || ''
  const result = await getCoverageByZip(zipCode)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {zipCode ? `Internet Coverage in ${zipCode}` : 'Check Internet Coverage'}
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            {zipCode
              ? `Broadband availability in your area`
              : `Enter your ZIP code to see broadband coverage data`}
          </p>

          <ZipSearch />
        </div>

        {/* Results */}
        {result && (
          <div className="mt-12">
            {/* Location Info */}
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

            {/* Coverage by Technology */}
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
          </div>
        )}

        {/* No data found */}
        {zipCode && !result && (
          <div className="mt-12 text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No Coverage Data Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We don't have coverage data for ZIP code {zipCode}.
              Try a nearby ZIP code or check back later.
            </p>
          </div>
        )}

        {/* No search yet */}
        {!zipCode && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <div className="text-3xl mb-3">1</div>
              <h3 className="font-semibold mb-2">Enter Your ZIP</h3>
              <p className="text-sm text-gray-400">Type your 5-digit ZIP code to start</p>
            </div>
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <div className="text-3xl mb-3">2</div>
              <h3 className="font-semibold mb-2">View Coverage</h3>
              <p className="text-sm text-gray-400">See broadband availability by technology</p>
            </div>
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <div className="text-3xl mb-3">3</div>
              <h3 className="font-semibold mb-2">Find Providers</h3>
              <p className="text-sm text-gray-400">Contact providers that serve your area</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
