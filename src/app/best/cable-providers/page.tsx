import { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { getProvidersByZip, getProvidersByTechnology, getCityForZip } from '@/lib/getProvidersByLocation'
import { RelatedRankings } from '@/components/RelatedRankings'
import { LocationAwareRankings } from '@/components/LocationAwareRankings'

export const metadata: Metadata = {
  title: 'Best Cable Internet Providers 2025 | Top-Rated Cable ISPs',
  description: 'Compare the best cable internet providers in 2025. Find top-rated cable ISPs with fast speeds, wide availability, and competitive pricing near you.',
}

// Provider details for display (pros/cons, ratings, etc.)
const providerDetails: Record<string, {
  maxSpeed: string
  startingPrice: string
  pros: string[]
  cons: string[]
  rating: number
}> = {
  'xfinity': {
    maxSpeed: '2 Gbps',
    startingPrice: '$35/mo',
    pros: ['Widest cable coverage', 'Fast speeds available', 'Bundle options with TV'],
    cons: ['Data caps in most areas', 'Price increases after promo', 'Equipment rental fees'],
    rating: 4.0,
  },
  'spectrum': {
    maxSpeed: '1 Gbps',
    startingPrice: '$50/mo',
    pros: ['No data caps', 'No contracts required', 'Free modem included'],
    cons: ['Upload speeds lag behind', 'Limited to 1 Gbps max', 'Price increases after year 1'],
    rating: 3.9,
  },
  'cox': {
    maxSpeed: '2 Gbps',
    startingPrice: '$50/mo',
    pros: ['Strong regional coverage', 'Panoramic WiFi option', 'Good bundle deals'],
    cons: ['1.25TB data cap', 'Higher prices than competitors', 'Limited availability'],
    rating: 3.7,
  },
  'optimum': {
    maxSpeed: '1 Gbps',
    startingPrice: '$40/mo',
    pros: ['Competitive pricing', 'No annual contracts', 'Free installation promos'],
    cons: ['Regional availability only', 'Data caps apply', 'Customer service issues'],
    rating: 3.5,
  },
  'mediacom': {
    maxSpeed: '1 Gbps',
    startingPrice: '$30/mo',
    pros: ['Low starting prices', 'Good rural coverage', 'Xtream WiFi360'],
    cons: ['Data caps on all plans', 'Limited to certain regions', 'Speeds vary by area'],
    rating: 3.4,
  },
  'wow': {
    maxSpeed: '1 Gbps',
    startingPrice: '$40/mo',
    pros: ['No contracts', 'Competitive pricing', 'Good customer service'],
    cons: ['Limited regional availability', 'Data caps on some plans'],
    rating: 3.6,
  },
  'astound': {
    maxSpeed: '1.2 Gbps',
    startingPrice: '$35/mo',
    pros: ['Fast speeds', 'No contracts', 'Local customer service'],
    cons: ['Very limited availability', 'Prices vary by region'],
    rating: 3.5,
  },
  'rcn': {
    maxSpeed: '1 Gbps',
    startingPrice: '$35/mo',
    pros: ['No contracts', 'Good value', 'Reliable service'],
    cons: ['Very limited geographic coverage', 'Fewer plan options'],
    rating: 3.6,
  },
  'suddenlink': {
    maxSpeed: '1 Gbps',
    startingPrice: '$40/mo',
    pros: ['Available in rural areas', 'Bundle options'],
    cons: ['Data caps apply', 'Mixed customer reviews'],
    rating: 3.2,
  },
  'atlantic-broadband': {
    maxSpeed: '1 Gbps',
    startingPrice: '$40/mo',
    pros: ['No contracts', 'Good regional coverage'],
    cons: ['Limited to East Coast', 'Data caps on some plans'],
    rating: 3.4,
  },
}

// States where cable is most common
const topCableStates = [
  { name: 'California', slug: 'california', code: 'CA' },
  { name: 'Texas', slug: 'texas', code: 'TX' },
  { name: 'Florida', slug: 'florida', code: 'FL' },
  { name: 'New York', slug: 'new-york', code: 'NY' },
  { name: 'Pennsylvania', slug: 'pennsylvania', code: 'PA' },
  { name: 'Ohio', slug: 'ohio', code: 'OH' },
]

async function getCableCoverageStats() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('zip_broadband_coverage')
    .select('cable_100_20')
    .not('cable_100_20', 'is', null)
    .limit(1000)

  if (!data || data.length === 0) {
    return { avgCoverage: 89, totalZips: 28801 }
  }

  const avgCoverage = Math.round(
    (data.reduce((sum, row) => sum + (row.cable_100_20 || 0), 0) / data.length) * 100
  )

  return { avgCoverage, totalZips: 28801 }
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < fullStars
              ? 'text-yellow-400'
              : i === fullStars && hasHalf
              ? 'text-yellow-400'
              : 'text-gray-600'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

export default async function BestCableProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ zip?: string }>
}) {
  const params = await searchParams
  const zipCode = params.zip
  const { avgCoverage, totalZips } = await getCableCoverageStats()

  // Get providers based on location or show national list
  let providers: Array<{
    id: number
    name: string
    slug: string
    technologies: string[]
    category: string
    coveragePercent?: number
  }> = []
  let cityName: string | null = null
  let isFiltered = false

  if (zipCode && /^\d{5}$/.test(zipCode)) {
    // Get location-specific providers
    const locationProviders = await getProvidersByZip(zipCode, 'Cable')
    if (locationProviders.length > 0) {
      providers = locationProviders
      cityName = await getCityForZip(zipCode)
      isFiltered = true
    }
  }

  // If no location or no providers found, show national list
  if (providers.length === 0) {
    const allCableProviders = await getProvidersByTechnology('Cable')
    providers = allCableProviders.map(p => ({ ...p, coveragePercent: undefined }))
  }

  // Sort by rating (from our details) if we have it
  providers.sort((a, b) => {
    const ratingA = providerDetails[a.slug]?.rating || 0
    const ratingB = providerDetails[b.slug]?.rating || 0
    return ratingB - ratingA
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/providers" className="hover:text-white">Providers</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Best Cable Providers</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            2025 Rankings
          </span>
          <h1 className="text-4xl font-bold mb-4 gradient-text-ocean">
            Best Cable Internet Providers
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Cable internet offers fast speeds and wide availability across the US.
            Compare top-rated cable ISPs to find the best option in your area.
          </p>

          {/* Location-aware component */}
          <LocationAwareRankings
            technology="Cable"
            currentZip={zipCode}
            cityName={cityName}
            isFiltered={isFiltered}
            providerCount={providers.length}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="futuristic-card rounded-xl p-4 text-center glow-burst-hover">
            <div className="text-2xl font-bold gradient-text-ocean">{avgCoverage}%</div>
            <div className="text-sm text-gray-400">Avg Cable Coverage</div>
          </div>
          <div className="futuristic-card rounded-xl p-4 text-center glow-burst-emerald">
            <div className="text-2xl font-bold gradient-text-fresh">2 Gbps</div>
            <div className="text-sm text-gray-400">Top Speeds Available</div>
          </div>
          <div className="futuristic-card rounded-xl p-4 text-center glow-burst-hover">
            <div className="text-2xl font-bold gradient-text-purple">{providers.length}</div>
            <div className="text-sm text-gray-400">{isFiltered ? 'Available Here' : 'Cable Providers'}</div>
          </div>
        </div>

        {/* Why Cable */}
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-800/50 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">Why Choose Cable Internet?</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Wide availability</strong> - Covers 89% of US households</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Fast download speeds</strong> - Up to 2 Gbps in some areas</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Bundle savings</strong> - Combine with TV and phone</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Reliable connection</strong> - Proven infrastructure</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-800/50">
            <p className="text-sm text-gray-400">
              <strong>Cable vs Fiber:</strong> While <Link href="/best/fiber-providers" className="text-blue-400 hover:text-blue-300">fiber offers faster upload speeds</Link>,
              cable is more widely available and often more affordable. For most households, cable provides plenty of speed for streaming, gaming, and remote work.
            </p>
          </div>
        </div>

        {/* Provider Rankings */}
        <h2 className="text-2xl font-semibold mb-6">
          {isFiltered ? `Cable Providers in ${cityName || `ZIP ${zipCode}`}` : 'Top Cable Providers Ranked'}
        </h2>

        {providers.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center mb-12">
            <p className="text-gray-400 mb-4">No cable providers found for this location.</p>
            <Link href="/best/cable-providers" className="text-blue-400 hover:text-blue-300">
              View all cable providers →
            </Link>
          </div>
        ) : (
          <div className="space-y-6 mb-12">
            {providers.map((provider, index) => {
              const details = providerDetails[provider.slug]
              return (
                <div
                  key={provider.slug}
                  className="futuristic-card corner-accent rounded-xl p-6 hover:border-blue-600/50 transition-colors glow-burst-hover"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">
                          <Link href={`/providers/${provider.slug}`} className="hover:text-blue-400 transition-colors">
                            {provider.name}
                          </Link>
                        </h3>
                        {details && <StarRating rating={details.rating} />}
                      </div>
                    </div>
                    <div className="flex gap-6 text-center">
                      {details ? (
                        <>
                          <div>
                            <div className="text-lg font-bold text-blue-400">{details.maxSpeed}</div>
                            <div className="text-xs text-gray-500">Max Speed</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-400">{details.startingPrice}</div>
                            <div className="text-xs text-gray-500">Starting At</div>
                          </div>
                        </>
                      ) : (
                        <div>
                          <div className="text-lg font-bold text-blue-400">Cable</div>
                          <div className="text-xs text-gray-500">Technology</div>
                        </div>
                      )}
                      {provider.coveragePercent !== undefined && (
                        <div>
                          <div className="text-lg font-bold text-purple-400">{provider.coveragePercent}%</div>
                          <div className="text-xs text-gray-500">Local Coverage</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {details && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-green-400 mb-2">Pros</div>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {details.pros.map((pro, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-red-400 mb-2">Cons</div>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {details.cons.map((con, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Browse by State - Internal Links */}
        <div className="futuristic-card rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4 gradient-text-fresh">Find Cable Internet by State</h2>
          <p className="text-sm text-gray-400 mb-4">
            Cable availability varies by location. Check providers in your state:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {topCableStates.map((state) => (
              <Link
                key={state.slug}
                href={`/internet/${state.slug}`}
                className="flex items-center gap-2 px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
              >
                <span className="text-blue-400 group-hover:text-blue-300">{state.code}</span>
                <span className="text-gray-300 group-hover:text-white">{state.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/internet" className="text-sm text-blue-400 hover:text-blue-300">
              View all 50 states →
            </Link>
          </div>
        </div>

        {/* Related Guides */}
        <div className="futuristic-card rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4 gradient-text-ocean">Related Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/compare/technology/fiber-vs-cable"
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-medium mb-1">Fiber vs Cable Internet</h3>
              <p className="text-sm text-gray-400">Which technology is right for you?</p>
            </Link>
            <Link
              href="/guides/gaming"
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-medium mb-1">Best Internet for Gaming</h3>
              <p className="text-sm text-gray-400">Low latency options for online gaming</p>
            </Link>
            <Link
              href="/guides/streaming"
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-medium mb-1">Best Internet for Streaming</h3>
              <p className="text-sm text-gray-400">Find the right speed for Netflix, Hulu, and more</p>
            </Link>
            <Link
              href="/compare/technology/cable-vs-5g"
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-medium mb-1">Cable vs 5G Home Internet</h3>
              <p className="text-sm text-gray-400">Traditional cable vs new wireless options</p>
            </Link>
          </div>
        </div>

        {/* Related Rankings */}
        <RelatedRankings title="More Internet Rankings" />

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Check Cable Availability</h2>
          <p className="text-gray-400 mb-6">Enter your ZIP code to see which cable providers serve your address</p>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Find Cable in Your Area
          </Link>
        </div>
      </div>
    </div>
  )
}
