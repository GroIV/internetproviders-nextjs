import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import { GuidesClient } from './GuidesClient'

export const metadata: Metadata = {
  title: 'Internet Guides',
  description: 'Comprehensive guides to help you choose the best internet service. Compare providers, understand speeds, and find the right plan for your needs.',
}

// Define guide templates - these match the [slug] page templates
const guideTemplates = [
  {
    slug: 'best-internet-providers',
    category: 'comparison',
    title: 'Best Internet Providers',
    description: 'Compare the top-rated internet providers available in your area.',
    icon: '🏆',
    color: 'bg-blue-600/20 text-blue-400',
  },
  {
    slug: 'budget',
    category: 'budget',
    title: 'Cheapest Internet Options',
    description: 'Find affordable internet plans and money-saving tips.',
    icon: '💰',
    color: 'bg-green-600/20 text-green-400',
  },
  {
    slug: 'speed',
    category: 'speed-guide',
    title: 'Internet Speed Guide',
    description: 'Calculate the right internet speed for your household.',
    icon: '⚡',
    color: 'bg-cyan-600/20 text-cyan-400',
  },
  {
    slug: 'fiber',
    category: 'comparison',
    title: 'Fiber vs Cable Internet',
    description: 'Compare fiber and cable options to find the best fit.',
    icon: '🔌',
    color: 'bg-blue-600/20 text-blue-400',
  },
  {
    slug: 'gaming',
    category: 'gaming',
    title: 'Best Internet for Gaming',
    description: 'Low latency, high-speed options for competitive gaming.',
    icon: '🎮',
    color: 'bg-purple-600/20 text-purple-400',
  },
  {
    slug: 'streaming',
    category: 'streaming',
    title: 'Best Internet for Streaming',
    description: 'Perfect speeds for Netflix, YouTube, and live streaming.',
    icon: '📺',
    color: 'bg-red-600/20 text-red-400',
  },
  {
    slug: 'work-from-home',
    category: 'work-from-home',
    title: 'Best Internet for Remote Work',
    description: 'Reliable internet for video calls and productivity.',
    icon: '💼',
    color: 'bg-indigo-600/20 text-indigo-400',
  },
  {
    slug: 'no-contract',
    category: 'no-contracts',
    title: 'No-Contract Internet Plans',
    description: 'Month-to-month options with no long-term commitment.',
    icon: '📝',
    color: 'bg-orange-600/20 text-orange-400',
  },
  {
    slug: 'family',
    category: 'family',
    title: 'Best Internet for Families',
    description: 'Plans that handle multiple devices and heavy usage.',
    icon: '👨‍👩‍👧‍👦',
    color: 'bg-pink-600/20 text-pink-400',
  },
]

const categoryLabels: Record<string, string> = {
  'budget': 'Budget-Friendly',
  'gaming': 'Gaming',
  'comparison': 'Comparisons',
  'speed-guide': 'Speed Guides',
  'no-contracts': 'No Contract',
  'streaming': 'Streaming',
  'work-from-home': 'Work From Home',
  'family': 'Family',
}

// Get city info for a ZIP code
async function getZipInfo(zipCode: string): Promise<{ city: string | null; state: string | null; providerCount: number }> {
  if (!zipCode || !/^\d{5}$/.test(zipCode)) {
    return { city: null, state: null, providerCount: 0 }
  }

  const supabase = createAdminClient()

  // Get city from coverage data
  const { data: coverageData } = await supabase
    .from('zip_broadband_coverage')
    .select('city')
    .eq('zip_code', zipCode)
    .single()

  // Get CBSA to count providers
  const { data: zipData } = await supabase
    .from('zip_cbsa_mapping')
    .select('cbsa_code')
    .eq('zip_code', zipCode)
    .single()

  let providerCount = 0
  if (zipData?.cbsa_code) {
    const { count } = await supabase
      .from('cbsa_providers')
      .select('*', { count: 'exact', head: true })
      .eq('cbsa_code', zipData.cbsa_code)

    providerCount = count || 0
  }

  return {
    city: coverageData?.city || null,
    state: null,
    providerCount,
  }
}

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; zip?: string }>
}) {
  const params = await searchParams
  const category = params.category
  const zipCode = params.zip

  // Get location info if ZIP provided
  const zipInfo = zipCode ? await getZipInfo(zipCode) : null
  const locationName = zipInfo?.city || (zipCode ? `ZIP ${zipCode}` : 'Your Area')

  // Filter guides by category if specified
  const filteredGuides = category
    ? guideTemplates.filter(g => g.category === category)
    : guideTemplates

  // Get category counts
  const categoryCounts: Record<string, number> = {}
  guideTemplates.forEach(g => {
    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text-ocean">
            {zipInfo?.city ? `Internet Guides for ${zipInfo.city}` : 'Internet Guides'}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Expert guides to help you find the perfect internet service
            {zipInfo?.city && ` in ${zipInfo.city}`}.
            {zipInfo?.providerCount ? ` Compare ${zipInfo.providerCount} providers in your area.` : ''}
          </p>
        </div>

        {/* Location-aware component for auto-redirect */}
        <GuidesClient
          zipCode={zipCode}
          zipHasGuides={true}
          categoryLabels={categoryLabels}
          categoryColors={{}}
        />

        {/* ZIP Input if no ZIP */}
        {!zipCode && (
          <div className="bg-blue-900/30 border border-blue-800/50 rounded-xl p-6 mb-8 text-center">
            <p className="text-lg text-gray-300 mb-4">
              Enter your ZIP code to see personalized guides for your area
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Enter Your ZIP Code
            </Link>
          </div>
        )}

        {/* Location Info */}
        {zipCode && zipInfo?.city && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-300">
                  Showing guides for <strong className="text-white">{zipInfo.city}</strong> ({zipCode})
                </span>
              </div>
              <Link
                href="/guides"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Change location
              </Link>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Link
            href={`/guides${zipCode ? `?zip=${zipCode}` : ''}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All ({guideTemplates.length})
          </Link>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const count = categoryCounts[key] || 0
            if (count === 0) return null
            const icons: Record<string, string> = {
              'budget': '💰',
              'gaming': '🎮',
              'comparison': '🔌',
              'speed-guide': '⚡',
              'no-contracts': '📝',
              'streaming': '📺',
              'work-from-home': '💼',
              'family': '👨‍👩‍👧‍👦',
            }
            return (
              <Link
                key={key}
                href={`/guides?category=${key}${zipCode ? `&zip=${zipCode}` : ''}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {icons[key]} {label} ({count})
              </Link>
            )
          })}
        </div>

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredGuides.map((guide) => {
            // Personalize title for location
            const personalizedTitle = zipInfo?.city
              ? `${guide.title} in ${zipInfo.city}`
              : guide.title

            return (
              <article
                key={guide.slug}
                className="futuristic-card corner-accent rounded-xl overflow-hidden transition-colors group glow-burst-hover"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${guide.color}`}>
                      {guide.icon} {categoryLabels[guide.category] || guide.category}
                    </span>
                    {zipCode && (
                      <span className="text-xs text-gray-500">{zipCode}</span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    <Link href={`/guides/${guide.slug}${zipCode ? `?zip=${zipCode}` : ''}`}>
                      {personalizedTitle}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                    {zipInfo?.city
                      ? guide.description.replace('your area', zipInfo.city)
                      : guide.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/guides/${guide.slug}${zipCode ? `?zip=${zipCode}` : ''}`}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                    >
                      Read Guide
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    {zipInfo?.city && (
                      <span className="text-xs text-gray-500">{zipInfo.city}</span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No guides found for this category.</p>
            <Link href={`/guides${zipCode ? `?zip=${zipCode}` : ''}`} className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
              View all guides
            </Link>
          </div>
        )}

        {/* Provider Stats for ZIP */}
        {zipCode && zipInfo?.providerCount && zipInfo.providerCount > 0 && (
          <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-8 text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {zipInfo.providerCount} Providers Available in {locationName}
            </h2>
            <p className="text-gray-400 mb-6">
              Compare plans, speeds, and pricing from all available internet providers
            </p>
            <Link
              href={`/compare?zip=${zipCode}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Compare Providers
            </Link>
          </div>
        )}

        {/* Popular Locations */}
        <div className="futuristic-card rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6 text-center gradient-text-fresh">Browse by Location</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <Link
              href="/internet/texas"
              className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              Texas
            </Link>
            <Link
              href="/internet/california"
              className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              California
            </Link>
            <Link
              href="/internet/florida"
              className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              Florida
            </Link>
            <Link
              href="/internet/new-york"
              className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              New York
            </Link>
          </div>
          <div className="text-center mt-4">
            <Link
              href="/internet"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View all states →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
