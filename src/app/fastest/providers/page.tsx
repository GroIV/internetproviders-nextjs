import { Metadata } from 'next'
import Link from 'next/link'
import { LocationInfo } from '@/components/LocationInfo'
import { RelatedRankings } from '@/components/RelatedRankings'

export const metadata: Metadata = {
  title: 'Fastest Internet Providers 2025 | Gigabit & Multi-Gig ISPs',
  description: 'Compare the fastest internet providers offering gigabit and multi-gig speeds. Find providers with 1 Gbps to 8 Gbps download speeds in your area.',
}

const fastestProviders = [
  {
    name: 'Google Fiber',
    slug: 'google-fiber',
    maxSpeed: '8 Gbps',
    technology: 'Fiber',
    latency: '< 5ms',
    price: '$150/mo',
    uploadSpeed: '8 Gbps',
    availability: 'Limited (20+ cities)',
    color: 'from-red-500 to-yellow-500',
  },
  {
    name: 'AT&T Fiber',
    slug: 'att',
    maxSpeed: '5 Gbps',
    technology: 'Fiber',
    latency: '< 10ms',
    price: '$180/mo',
    uploadSpeed: '5 Gbps',
    availability: 'Wide (21 states)',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Frontier Fiber',
    slug: 'frontier',
    maxSpeed: '5 Gbps',
    technology: 'Fiber',
    latency: '< 10ms',
    price: '$155/mo',
    uploadSpeed: '5 Gbps',
    availability: 'Growing (25 states)',
    color: 'from-red-600 to-red-400',
  },
  {
    name: 'Verizon Fios',
    slug: 'verizon',
    maxSpeed: '2.3 Gbps',
    technology: 'Fiber',
    latency: '< 8ms',
    price: '$120/mo',
    uploadSpeed: '2.3 Gbps',
    availability: 'East Coast (9 states)',
    color: 'from-red-500 to-black',
  },
  {
    name: 'Xfinity',
    slug: 'xfinity',
    maxSpeed: '2 Gbps',
    technology: 'Cable',
    latency: '< 15ms',
    price: '$120/mo',
    uploadSpeed: '200 Mbps',
    availability: 'Nationwide (40 states)',
    color: 'from-purple-500 to-blue-500',
  },
  {
    name: 'Cox',
    slug: 'cox',
    maxSpeed: '2 Gbps',
    technology: 'Fiber/Cable',
    latency: '< 12ms',
    price: '$150/mo',
    uploadSpeed: '2 Gbps',
    availability: 'Regional (18 states)',
    color: 'from-orange-500 to-orange-600',
  },
]

const speedTiers = [
  {
    tier: 'Gigabit (1 Gbps)',
    description: 'Download a 4K movie in under 1 minute',
    goodFor: ['Large households (5+)', '4K streaming on multiple devices', 'Serious gaming'],
    providers: 'Most major ISPs',
  },
  {
    tier: '2 Gigabit (2 Gbps)',
    description: 'Download a 4K movie in 30 seconds',
    goodFor: ['Power users', 'Home offices with heavy uploads', 'Content creators'],
    providers: 'AT&T, Verizon, Xfinity, Cox',
  },
  {
    tier: '5 Gigabit (5 Gbps)',
    description: 'Download a 4K movie in 12 seconds',
    goodFor: ['Tech enthusiasts', 'Professional streamers', 'Future-proofing'],
    providers: 'AT&T, Frontier, Google Fiber',
  },
  {
    tier: '8 Gigabit (8 Gbps)',
    description: 'Download a 4K movie in 8 seconds',
    goodFor: ['Ultimate speed seekers', 'Data centers', 'Enterprise users'],
    providers: 'Google Fiber only',
  },
]

export default function FastestProvidersPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/providers" className="hover:text-white">Providers</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Fastest Providers</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded-full text-sm font-medium mb-4">
            Speed Champions
          </span>
          <h1 className="text-4xl font-bold mb-4">
            Fastest Internet Providers
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Looking for blazing-fast speeds? These providers offer gigabit and
            multi-gigabit connections for the ultimate internet experience.
          </p>
          <LocationInfo message="Showing fastest providers" />
        </div>

        {/* Speed Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">8 Gbps</div>
            <div className="text-sm text-gray-400">Fastest Available</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">&lt; 5ms</div>
            <div className="text-sm text-gray-400">Best Latency</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">Fiber</div>
            <div className="text-sm text-gray-400">Top Technology</div>
          </div>
        </div>

        {/* Provider Rankings */}
        <h2 className="text-2xl font-semibold mb-6">Fastest ISPs Ranked by Max Speed</h2>
        <div className="space-y-4 mb-12">
          {fastestProviders.map((provider, index) => (
            <div
              key={provider.name}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-600/50 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${provider.color} rounded-xl flex items-center justify-center text-xl font-bold text-white`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      <Link href={`/providers/${provider.slug}`} className="hover:text-cyan-400 transition-colors">
                        {provider.name}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">{provider.technology}</span>
                      <span className="text-gray-700">•</span>
                      <span className="text-gray-500">{provider.availability}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-xl font-bold text-cyan-400">{provider.maxSpeed}</div>
                    <div className="text-xs text-gray-500">Download</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-400">{provider.uploadSpeed}</div>
                    <div className="text-xs text-gray-500">Upload</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-400">{provider.latency}</div>
                    <div className="text-xs text-gray-500">Latency</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-yellow-400">{provider.price}</div>
                    <div className="text-xs text-gray-500">Price</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Speed Tiers Explained */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-800/50 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-6">Speed Tiers Explained</h2>
          <div className="space-y-4">
            {speedTiers.map((tier) => (
              <div key={tier.tier} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-cyan-400">{tier.tier}</h3>
                  <span className="text-sm text-gray-400">{tier.providers}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{tier.description}</p>
                <div className="flex flex-wrap gap-2">
                  {tier.goodFor.map((use, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Do You Need It */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">Do You Really Need Multi-Gig Speeds?</h2>
          <div className="text-sm text-gray-400 space-y-4">
            <p>
              While 8 Gbps sounds impressive, most households won't use anywhere near that bandwidth.
              Here's a reality check:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span><strong>4K streaming</strong> only requires about 25 Mbps per stream</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span><strong>Online gaming</strong> uses minimal bandwidth; latency matters more</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>Uploading large files</strong> (content creators, backups) benefits most from high speeds</span>
              </li>
            </ul>
            <p className="text-gray-300">
              <strong>Our recommendation:</strong> 500 Mbps - 1 Gbps is plenty for most households.
              Go multi-gig only if you regularly transfer large files or have 10+ heavy users.
            </p>
          </div>
        </div>

        {/* Related Rankings */}
        <RelatedRankings title="More Internet Rankings" />

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-cyan-900/50 to-purple-900/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Check Gigabit Availability</h2>
          <p className="text-gray-400 mb-6">Enter your ZIP code to see the fastest options at your address</p>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center px-6 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
          >
            Find Fast Internet Near You
          </Link>
        </div>
      </div>
    </div>
  )
}
