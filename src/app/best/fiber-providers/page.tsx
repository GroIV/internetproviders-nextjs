import { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { ZipSearch } from '@/components/ZipSearch'

export const metadata: Metadata = {
  title: 'Best Fiber Internet Providers 2025 | Top-Rated Fiber ISPs',
  description: 'Compare the best fiber internet providers in 2025. Find top-rated fiber optic ISPs with the fastest speeds, best reliability, and competitive pricing.',
}

const fiberProviderDetails = [
  {
    name: 'AT&T Fiber',
    maxSpeed: '5 Gbps',
    startingPrice: '$55/mo',
    pros: ['Symmetrical upload/download', 'No data caps', 'Wide availability'],
    cons: ['Price increases after promo', 'Equipment fee'],
    rating: 4.5,
  },
  {
    name: 'Verizon Fios',
    maxSpeed: '2 Gbps',
    startingPrice: '$50/mo',
    pros: ['No contracts required', 'Excellent reliability', 'Great customer service'],
    cons: ['Limited to East Coast', 'Router rental fee'],
    rating: 4.6,
  },
  {
    name: 'Google Fiber',
    maxSpeed: '8 Gbps',
    startingPrice: '$70/mo',
    pros: ['Fastest speeds available', 'Simple pricing', 'No data caps'],
    cons: ['Very limited availability', 'No bundle options'],
    rating: 4.7,
  },
  {
    name: 'Frontier Fiber',
    maxSpeed: '5 Gbps',
    startingPrice: '$50/mo',
    pros: ['Competitive pricing', 'No annual contracts', 'Growing coverage'],
    cons: ['Customer service varies', 'Limited TV bundles'],
    rating: 4.2,
  },
  {
    name: 'CenturyLink/Quantum Fiber',
    maxSpeed: '940 Mbps',
    startingPrice: '$30/mo',
    pros: ['Price for life guarantee', 'No contracts', 'Good value'],
    cons: ['Slower max speeds', 'Limited fiber availability'],
    rating: 4.0,
  },
]

async function getFiberCoverageStats() {
  const supabase = createAdminClient()

  // Get average fiber coverage from our data
  const { data } = await supabase
    .from('zip_broadband_coverage')
    .select('fiber_100_20')
    .not('fiber_100_20', 'is', null)
    .limit(1000)

  if (!data || data.length === 0) {
    return { avgCoverage: 43, totalZips: 28801 }
  }

  const avgCoverage = Math.round(
    (data.reduce((sum, row) => sum + (row.fiber_100_20 || 0), 0) / data.length) * 100
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

export default async function BestFiberProvidersPage() {
  const { avgCoverage, totalZips } = await getFiberCoverageStats()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/providers" className="hover:text-white">Providers</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Best Fiber Providers</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium mb-4">
            2025 Rankings
          </span>
          <h1 className="text-4xl font-bold mb-4">
            Best Fiber Internet Providers
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Fiber optic internet offers the fastest, most reliable connection available.
            Compare top-rated fiber ISPs to find the best option in your area.
          </p>
          <ZipSearch />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{avgCoverage}%</div>
            <div className="text-sm text-gray-400">Avg Fiber Coverage</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">5+ Gbps</div>
            <div className="text-sm text-gray-400">Top Speeds Available</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{totalZips.toLocaleString()}</div>
            <div className="text-sm text-gray-400">ZIP Codes Analyzed</div>
          </div>
        </div>

        {/* Why Fiber */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-800/50 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">Why Choose Fiber Internet?</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Symmetrical speeds</strong> - Upload as fast as download</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Low latency</strong> - Best for gaming and video calls</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>No slowdowns</strong> - Consistent speeds at peak times</span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Future-proof</strong> - Handles increasing bandwidth needs</span>
            </div>
          </div>
        </div>

        {/* Provider Rankings */}
        <h2 className="text-2xl font-semibold mb-6">Top Fiber Providers Ranked</h2>
        <div className="space-y-6 mb-12">
          {fiberProviderDetails.map((provider, index) => (
            <div
              key={provider.name}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-600/50 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{provider.name}</h3>
                    <StarRating rating={provider.rating} />
                  </div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-lg font-bold text-purple-400">{provider.maxSpeed}</div>
                    <div className="text-xs text-gray-500">Max Speed</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">{provider.startingPrice}</div>
                    <div className="text-xs text-gray-500">Starting At</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-green-400 mb-2">Pros</div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {provider.pros.map((pro, i) => (
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
                    {provider.cons.map((con, i) => (
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
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Check Fiber Availability</h2>
          <p className="text-gray-400 mb-6">Enter your ZIP code to see which fiber providers serve your address</p>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Find Fiber in Your Area
          </Link>
        </div>
      </div>
    </div>
  )
}
