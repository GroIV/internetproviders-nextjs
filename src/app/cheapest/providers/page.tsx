import { Metadata } from 'next'
import Link from 'next/link'
import { LocationInfo } from '@/components/LocationInfo'
import { RelatedRankings } from '@/components/RelatedRankings'

export const metadata: Metadata = {
  title: 'Cheapest Internet Providers 2025 | Budget-Friendly ISPs',
  description: 'Find the cheapest internet providers in 2025. Compare affordable internet plans starting under $30/month. Get reliable internet without breaking the bank.',
}

const cheapProviders = [
  {
    name: 'Spectrum Internet',
    slug: 'spectrum',
    price: '$30/mo',
    speed: '300 Mbps',
    highlight: 'No contracts',
    features: ['Free modem', 'No data caps', 'Free antivirus'],
    note: 'Price for 12 months, then $55/mo',
  },
  {
    name: 'Xfinity Connect',
    slug: 'xfinity',
    price: '$25/mo',
    speed: '75 Mbps',
    highlight: 'Lowest price',
    features: ['Peacock included', 'Flex streaming box', 'Access to hotspots'],
    note: 'Requires 1-year agreement',
  },
  {
    name: 'AT&T Internet Air',
    slug: 'att',
    price: '$35/mo',
    speed: '100+ Mbps',
    highlight: '5G wireless',
    features: ['No annual contract', 'Free installation', 'Includes gateway'],
    note: 'Requires eligible address',
  },
  {
    name: 'T-Mobile 5G Home',
    slug: 't-mobile',
    price: '$40/mo',
    speed: '100+ Mbps',
    highlight: 'No credit check',
    features: ['No annual contracts', 'Price lock guarantee', 'Easy setup'],
    note: '$50/mo without other T-Mobile services',
  },
  {
    name: 'Verizon 5G Home',
    slug: 'verizon',
    price: '$35/mo',
    speed: '300+ Mbps',
    highlight: 'With mobile plan',
    features: ['No annual contract', 'Self-setup', 'Free router'],
    note: '$60/mo without Verizon mobile',
  },
  {
    name: 'Frontier Fiber',
    slug: 'frontier',
    price: '$50/mo',
    speed: '500 Mbps',
    highlight: 'Best fiber value',
    features: ['No contracts', 'No data caps', 'Price for life'],
    note: 'Fiber availability varies',
  },
]

const affordableProgramsInfo = [
  {
    name: 'ACP (Affordable Connectivity Program)',
    savings: 'Up to $30/mo',
    description: 'Federal program providing discounts to eligible low-income households',
    eligibility: 'Based on income or participation in assistance programs',
  },
  {
    name: 'Lifeline',
    savings: 'Up to $9.25/mo',
    description: 'FCC program for qualifying low-income subscribers',
    eligibility: 'Income at or below 135% of federal poverty guidelines',
  },
  {
    name: 'Internet Essentials (Comcast)',
    savings: '$10/mo internet',
    description: 'Low-cost internet for qualifying families',
    eligibility: 'Families with children eligible for free school lunch',
  },
]

export default function CheapestProvidersPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/providers" className="hover:text-white">Providers</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Cheapest Providers</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium mb-4">
            Budget-Friendly
          </span>
          <h1 className="text-4xl font-bold mb-4">
            Cheapest Internet Providers
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Get reliable internet without breaking the bank. We've found the most
            affordable options that still deliver good speeds and service.
          </p>
          <LocationInfo message="Showing affordable providers" />
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">$25</div>
            <div className="text-sm text-gray-400">Lowest Price/mo</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">75+ Mbps</div>
            <div className="text-sm text-gray-400">Min Speed</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">6+</div>
            <div className="text-sm text-gray-400">Budget Options</div>
          </div>
        </div>

        {/* Provider Cards */}
        <h2 className="text-2xl font-semibold mb-6">Best Budget Internet Plans</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {cheapProviders.map((provider, index) => (
            <div
              key={provider.name}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-600/50 transition-colors relative"
            >
              {index === 0 && (
                <div className="absolute -top-3 left-4 px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                  Best Value
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    <Link href={`/providers/${provider.slug}`} className="hover:text-green-400 transition-colors">
                      {provider.name}
                    </Link>
                  </h3>
                  <span className="text-xs text-green-400">{provider.highlight}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{provider.price}</div>
                  <div className="text-sm text-gray-500">{provider.speed}</div>
                </div>
              </div>

              <ul className="text-sm text-gray-400 space-y-1 mb-4">
                {provider.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <p className="text-xs text-gray-500 italic">{provider.note}</p>
            </div>
          ))}
        </div>

        {/* Assistance Programs */}
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-800/50 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">Low-Income Assistance Programs</h2>
          <p className="text-gray-400 text-sm mb-6">
            You may qualify for additional discounts through these government and provider programs:
          </p>
          <div className="space-y-4">
            {affordableProgramsInfo.map((program) => (
              <div key={program.name} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <h3 className="font-medium">{program.name}</h3>
                  <span className="text-green-400 font-semibold">{program.savings}</span>
                </div>
                <p className="text-sm text-gray-400 mb-1">{program.description}</p>
                <p className="text-xs text-gray-500"><strong>Eligibility:</strong> {program.eligibility}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">Tips for Getting the Best Deal</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">1.</span>
              <span><strong>Negotiate:</strong> Call and ask for promotional pricing, especially if you're a new customer or threatening to cancel.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">2.</span>
              <span><strong>Skip bundles:</strong> TV bundles often inflate the price. Streaming is usually cheaper.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">3.</span>
              <span><strong>Use your own modem:</strong> Avoid $10-15/mo equipment rental fees by buying your own.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">4.</span>
              <span><strong>Check for autopay:</strong> Many providers offer $5-10/mo discounts for automatic payments.</span>
            </div>
          </div>
        </div>

        {/* Related Rankings */}
        <RelatedRankings title="More Internet Rankings" />

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Find Affordable Internet Near You</h2>
          <p className="text-gray-400 mb-6">Enter your ZIP code to see the cheapest options available at your address</p>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Check Prices in Your Area
          </Link>
        </div>
      </div>
    </div>
  )
}
