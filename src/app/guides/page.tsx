import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import { GuidesClient } from './GuidesClient'
import { GuidesGrid } from './GuidesGrid'
import {
  Trophy, DollarSign, Zap, Gamepad2, Play,
  Briefcase, FileText, Users, Wifi, MapPin, Search
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Internet Guides | Expert Advice for Choosing Internet Service',
  description: 'Comprehensive guides to help you choose the best internet service. Compare providers, understand speeds, and find the right plan for your needs.',
}

// Guide definitions with improved descriptions
const guideTemplates = [
  {
    slug: 'best-internet-providers',
    category: 'comparison',
    title: 'Best Internet Providers',
    description: 'Side-by-side comparison of top providers with real speed data, pricing, and user ratings.',
  },
  {
    slug: 'budget',
    category: 'budget',
    title: 'Cheapest Internet Options',
    description: 'Plans under $50/month that deliver solid performance. Plus tips to lower your current bill.',
  },
  {
    slug: 'speed',
    category: 'speed-guide',
    title: 'Internet Speed Guide',
    description: 'Calculate exactly how much speed your household needs based on devices and usage.',
  },
  {
    slug: 'fiber',
    category: 'comparison',
    title: 'Fiber vs Cable Internet',
    description: 'Technical breakdown of fiber and cable with real-world performance comparisons.',
  },
  {
    slug: 'gaming',
    category: 'gaming',
    title: 'Best Internet for Gaming',
    description: 'Low-latency providers and optimal settings for lag-free competitive gaming.',
  },
  {
    slug: 'streaming',
    category: 'streaming',
    title: 'Best Internet for Streaming',
    description: 'Speed requirements for 4K streaming and recommendations for cord-cutters.',
  },
  {
    slug: 'work-from-home',
    category: 'work-from-home',
    title: 'Best Internet for Remote Work',
    description: 'Reliable connections for video calls, file uploads, and VPN performance.',
  },
  {
    slug: 'no-contract',
    category: 'no-contracts',
    title: 'No-Contract Internet Plans',
    description: 'Month-to-month options from major providers with no early termination fees.',
  },
  {
    slug: 'family',
    category: 'family',
    title: 'Best Internet for Families',
    description: 'High-bandwidth plans for households with multiple heavy users and devices.',
  },
]

const categoryConfig: Record<string, {
  label: string;
  gradient: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  'comparison': { label: 'Comparison', gradient: 'from-cyan-500 to-blue-500', Icon: Trophy },
  'budget': { label: 'Budget-Friendly', gradient: 'from-green-500 to-emerald-500', Icon: DollarSign },
  'speed-guide': { label: 'Speed Guide', gradient: 'from-cyan-500 to-purple-500', Icon: Zap },
  'gaming': { label: 'Gaming', gradient: 'from-purple-500 to-pink-500', Icon: Gamepad2 },
  'streaming': { label: 'Streaming', gradient: 'from-red-500 to-orange-500', Icon: Play },
  'work-from-home': { label: 'Work From Home', gradient: 'from-indigo-500 to-blue-500', Icon: Briefcase },
  'no-contracts': { label: 'No Contract', gradient: 'from-orange-500 to-amber-500', Icon: FileText },
  'family': { label: 'Family', gradient: 'from-pink-500 to-rose-500', Icon: Users },
}

// Get city info for a ZIP code
async function getZipInfo(zipCode: string): Promise<{ city: string | null; state: string | null; providerCount: number }> {
  if (!zipCode || !/^\d{5}$/.test(zipCode)) {
    return { city: null, state: null, providerCount: 0 }
  }

  const supabase = createAdminClient()

  const { data: coverageData } = await supabase
    .from('zip_broadband_coverage')
    .select('city')
    .eq('zip_code', zipCode)
    .single()

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

  const zipInfo = zipCode ? await getZipInfo(zipCode) : null
  const locationName = zipInfo?.city || (zipCode ? `ZIP ${zipCode}` : 'Your Area')

  const filteredGuides = category
    ? guideTemplates.filter(g => g.category === category)
    : guideTemplates

  const categoryCounts: Record<string, number> = {}
  guideTemplates.forEach(g => {
    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Effects */}
      <div className="relative overflow-hidden border-b border-gray-800/50">
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 text-sm text-gray-300 mb-6">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <span>Expert Guides</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {zipInfo?.city ? `Internet Guides for ${zipInfo.city}` : 'Internet Guides'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Make smarter decisions with data-driven guides covering speed, pricing, and provider comparisons
              {zipInfo?.city && ` for ${zipInfo.city}`}.
            </p>

            {/* Stats */}
            {zipInfo?.providerCount && zipInfo.providerCount > 0 ? (
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span>{zipInfo.city}</span>
                </div>
                <div className="w-px h-4 bg-gray-700" />
                <div className="text-gray-400">
                  <span className="text-white font-semibold">{zipInfo.providerCount}</span> providers available
                </div>
                <div className="w-px h-4 bg-gray-700" />
                <div className="text-gray-400">
                  <span className="text-white font-semibold">{guideTemplates.length}</span> guides
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <span className="text-white font-semibold">{guideTemplates.length}</span> comprehensive guides
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Location-aware component for auto-redirect */}
          <GuidesClient
            zipCode={zipCode}
            zipHasGuides={true}
            categoryLabels={{}}
            categoryColors={{}}
          />

          {/* ZIP Input Prompt */}
          {!zipCode && (
            <div className="relative bg-gray-900/60 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 mb-10 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Get Personalized Guides</h3>
                    <p className="text-sm text-gray-400">Enter your ZIP code to see providers in your area</p>
                  </div>
                </div>
                <Link
                  href="/"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Enter ZIP Code
                </Link>
              </div>
            </div>
          )}

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link
              href={`/guides${zipCode ? `?zip=${zipCode}` : ''}`}
              className={`group relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                !category
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-gray-800/60 backdrop-blur-sm text-gray-300 border border-gray-700/50 hover:border-gray-600/50 hover:text-white'
              }`}
            >
              All ({guideTemplates.length})
            </Link>
            {Object.entries(categoryConfig).map(([key, config]) => {
              const count = categoryCounts[key] || 0
              if (count === 0) return null
              const { Icon, label, gradient } = config
              const isActive = category === key

              return (
                <Link
                  key={key}
                  href={`/guides?category=${key}${zipCode ? `&zip=${zipCode}` : ''}`}
                  className={`group relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                      : 'bg-gray-800/60 backdrop-blur-sm text-gray-300 border border-gray-700/50 hover:border-gray-600/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label} ({count})
                </Link>
              )
            })}
          </div>

          {/* Guides Grid - Client Component */}
          <GuidesGrid
            guides={filteredGuides}
            zipCode={zipCode}
            cityName={zipInfo?.city || undefined}
          />

          {filteredGuides.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/60 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-4">No guides found for this category.</p>
              <Link
                href={`/guides${zipCode ? `?zip=${zipCode}` : ''}`}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View all guides
              </Link>
            </div>
          )}

          {/* Provider Stats CTA */}
          {zipCode && zipInfo?.providerCount && zipInfo.providerCount > 0 && (
            <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-10 text-center mt-12 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-purple-500/5" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/10 blur-3xl" />

              <div className="relative">
                <h2 className="text-3xl font-bold mb-3">
                  <span className="text-white">{zipInfo.providerCount} Providers</span>
                  <span className="text-gray-400"> in {locationName}</span>
                </h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  Ready to compare? See real plans, speeds, and pricing from all providers available at your address.
                </p>
                <Link
                  href={`/compare?zip=${zipCode}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/25"
                >
                  Compare All Providers
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Browse by State */}
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mt-12 overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-xl font-semibold mb-6 text-center">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Browse by State
                </span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Texas', href: '/internet/texas' },
                  { name: 'California', href: '/internet/california' },
                  { name: 'Florida', href: '/internet/florida' },
                  { name: 'New York', href: '/internet/new-york' },
                ].map((state) => (
                  <Link
                    key={state.name}
                    href={state.href}
                    className="group px-4 py-3 bg-gray-800/50 text-gray-300 rounded-xl text-center hover:bg-gray-800 hover:text-white transition-all border border-gray-700/50 hover:border-gray-600/50"
                  >
                    <span className="group-hover:text-purple-400 transition-colors">{state.name}</span>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-6">
                <Link
                  href="/internet"
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors inline-flex items-center gap-1"
                >
                  View all states
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
