import { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { LocationInfo } from '@/components/LocationInfo'
import { RelatedRankings } from '@/components/RelatedRankings'

export const metadata: Metadata = {
  title: 'Internet Deals & Promotions 2025 | Current ISP Offers',
  description: 'Find the best internet deals and promotions from top providers. Compare current offers, discounts, and limited-time pricing on internet plans.',
  alternates: {
    canonical: '/deals',
  },
}

const tagColors: Record<string, string> = {
  'AT&T Internet': 'bg-blue-600',
  'Xfinity': 'bg-purple-600',
  'Verizon Fios': 'bg-red-600',
  'Spectrum': 'bg-green-600',
  'Google Fiber': 'bg-yellow-600',
  'Frontier Fiber': 'bg-cyan-600',
  'Cox Internet': 'bg-orange-600',
  'T-Mobile': 'bg-pink-600',
}

const upcomingDeals = [
  {
    event: 'New Year Sale',
    date: 'January 2025',
    description: 'Many providers offer special pricing in January for new year promotions',
  },
  {
    event: 'Tax Season Deals',
    date: 'February-April 2025',
    description: 'ISPs often run promotions when people have tax refunds',
  },
  {
    event: 'Back to School',
    date: 'August 2025',
    description: 'Student discounts and family plans become widely available',
  },
]

async function getDeals() {
  const supabase = createAdminClient()

  // Get promotions from database
  const { data: promotions } = await supabase
    .from('provider_promotions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Get plans to show pricing info
  const { data: plans } = await supabase
    .from('provider_plans')
    .select('provider_slug, provider_name, price_promo')
    .order('price_promo', { ascending: true })

  // Create a map of lowest prices per provider
  const lowestPrices = new Map<string, number>()
  plans?.forEach(plan => {
    if (plan.price_promo && !lowestPrices.has(plan.provider_slug)) {
      lowestPrices.set(plan.provider_slug, plan.price_promo)
    }
  })

  return { promotions: promotions || [], lowestPrices }
}

export default async function DealsPage() {
  const { promotions, lowestPrices } = await getDeals()
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Deals & Promotions</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm font-medium mb-4">
            December 2025
          </span>
          <h1 className="text-4xl font-bold mb-4 gradient-text-warm">
            Internet Deals & Promotions
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Save money on your internet bill with these current promotions and
            limited-time offers from top providers.
          </p>
          <LocationInfo message="Showing deals available" />
        </div>

        {/* Featured Deal */}
        {promotions.length > 0 && (
          <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-800/50 rounded-xl p-8 mb-12">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <span className="inline-block px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium mb-3">
                  Featured Deal
                </span>
                <h2 className="text-2xl font-bold mb-2">
                  <Link href={`/providers/${promotions[0].provider_slug}`} className="hover:text-red-300 transition-colors">
                    {promotions[0].provider_name}
                  </Link>
                  {' '}- {promotions[0].offer_title}
                </h2>
                <p className="text-gray-300 mb-4">
                  {promotions[0].offer_description || promotions[0].requirements || 'Limited time offer for new customers.'}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {lowestPrices.get(promotions[0].provider_slug) && (
                    <span className="text-green-400">Plans from ${lowestPrices.get(promotions[0].provider_slug)}/mo</span>
                  )}
                  <span className="text-gray-500">•</span>
                  <span className="text-yellow-400">{promotions[0].valid_until || 'Limited time offer'}</span>
                </div>
              </div>
              <Link
                href="/compare"
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Check Availability
              </Link>
            </div>
          </div>
        )}

        {/* All Deals Grid */}
        <h2 className="text-2xl font-semibold mb-6">Current Deals</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {promotions.map((deal) => (
            <div
              key={deal.id}
              className="futuristic-card rounded-xl p-6 relative glow-burst-orange"
            >
              <span className={`absolute -top-3 right-4 px-3 py-1 ${tagColors[deal.provider_name] || 'bg-blue-600'} text-white text-xs font-medium rounded-full`}>
                {deal.promo_type === 'gift_card' ? 'Gift Card' : 'Deal'}
              </span>

              <h3 className="text-lg font-semibold mb-1">
                <Link href={`/providers/${deal.provider_slug}`} className="hover:text-blue-400 transition-colors">
                  {deal.provider_name}
                </Link>
              </h3>
              <p className="text-xl font-bold text-green-400 mb-2">{deal.offer_title}</p>
              <p className="text-sm text-gray-400 mb-4">{deal.requirements || deal.offer_description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="text-sm">
                  {lowestPrices.get(deal.provider_slug) ? (
                    <span className="text-white font-medium">Plans from ${lowestPrices.get(deal.provider_slug)}/mo</span>
                  ) : (
                    <span className="text-white font-medium">Contact for pricing</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {deal.valid_until ? `Expires: ${deal.valid_until}` : 'Limited time'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Deal Tips */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">How to Get the Best Deal</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-400">
            <div>
              <h3 className="font-medium text-white mb-2">Before You Sign Up</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Compare at least 3 providers in your area
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Check the post-promotional price
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Ask about equipment rental fees
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">Negotiation Tips</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Mention competitor offers
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Ask for the retention department
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Request waived installation fees
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upcoming Deals */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sale Events</h2>
          <div className="space-y-4">
            {upcomingDeals.map((event) => (
              <div key={event.event} className="flex items-start gap-4 pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{event.event}</h3>
                    <span className="text-xs text-gray-500">{event.date}</span>
                  </div>
                  <p className="text-sm text-gray-400">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Rankings */}
        <RelatedRankings title="More Internet Rankings" />

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Find Deals in Your Area</h2>
          <p className="text-gray-400 mb-6">
            Enter your ZIP code to see which promotions are available at your address
          </p>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Check Available Deals
          </Link>
        </div>
      </div>
    </div>
  )
}
