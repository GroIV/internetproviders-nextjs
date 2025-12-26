import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { GuideContent } from './GuideContent'
import {
  Trophy, DollarSign, Zap, Gamepad2, Play,
  Briefcase, FileText, Users, Wifi, MapPin, ChevronRight,
  ArrowRight, Signal
} from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ zip?: string }>
}

// Category configuration
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

// Guide templates with structured content
const guideTemplates: Record<string, {
  id: string
  category: string
  title: (city: string) => string
  description: (city: string) => string
  filterProviders?: (providers: Provider[]) => Provider[]
}> = {
  'best-internet-providers': {
    id: 'best-internet-providers',
    category: 'comparison',
    title: (city) => `Best Internet Providers in ${city}`,
    description: (city) => `Compare top-rated internet providers in ${city}. Real speed data, pricing, and user ratings.`,
  },
  gaming: {
    id: 'gaming',
    category: 'gaming',
    title: (city) => `Best Gaming Internet in ${city}`,
    description: (city) => `Low-latency internet for competitive gaming in ${city}. Get under 20ms ping.`,
    filterProviders: (providers) => providers.filter(p =>
      p.technologies?.some(t => ['Fiber', 'Cable', '5G'].includes(t))
    ),
  },
  budget: {
    id: 'budget',
    category: 'budget',
    title: (city) => `Cheapest Internet in ${city}`,
    description: (city) => `Affordable internet plans in ${city}. Quality service under $50/month.`,
  },
  speed: {
    id: 'speed',
    category: 'speed-guide',
    title: (city) => `Internet Speed Guide for ${city}`,
    description: (city) => `Calculate exactly how much speed your household needs in ${city}.`,
  },
  fiber: {
    id: 'fiber',
    category: 'comparison',
    title: (city) => `Fiber vs Cable Internet in ${city}`,
    description: (city) => `Compare fiber and cable internet options in ${city}. Which is right for you?`,
    filterProviders: (providers) => providers.filter(p =>
      p.technologies?.some(t => ['Fiber', 'Cable'].includes(t))
    ),
  },
  'no-contract': {
    id: 'no-contract',
    category: 'no-contracts',
    title: (city) => `No-Contract Internet in ${city}`,
    description: (city) => `Month-to-month internet plans in ${city}. Cancel anytime, no fees.`,
  },
  streaming: {
    id: 'streaming',
    category: 'streaming',
    title: (city) => `Best Internet for Streaming in ${city}`,
    description: (city) => `Perfect speeds for Netflix, YouTube, and 4K streaming in ${city}.`,
  },
  'work-from-home': {
    id: 'work-from-home',
    category: 'work-from-home',
    title: (city) => `Best Work From Home Internet in ${city}`,
    description: (city) => `Reliable internet for video calls and VPN in ${city}.`,
    filterProviders: (providers) => providers.filter(p =>
      p.technologies?.some(t => ['Fiber', 'Cable'].includes(t))
    ),
  },
  family: {
    id: 'family',
    category: 'family',
    title: (city) => `Best Internet for Families in ${city}`,
    description: (city) => `High-bandwidth plans for households with many devices in ${city}.`,
  },
}

interface Provider {
  name: string
  technologies: string[]
  coverage_pct: number
}

async function getLocationInfo(zipCode: string) {
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

  const city = coverageData?.city || `ZIP ${zipCode}`
  const cbsaCode = zipData?.cbsa_code || null

  return { city, cbsaCode }
}

async function getProviders(zipCode: string): Promise<Provider[]> {
  const supabase = createAdminClient()

  const { data: zipData } = await supabase
    .from('zip_cbsa_mapping')
    .select('cbsa_code')
    .eq('zip_code', zipCode)
    .single()

  if (!zipData?.cbsa_code) return []

  const { data: cbsaProviders } = await supabase
    .from('cbsa_providers')
    .select('provider_id, coverage_pct')
    .eq('cbsa_code', zipData.cbsa_code)
    .order('coverage_pct', { ascending: false })
    .limit(15)

  if (!cbsaProviders || cbsaProviders.length === 0) return []

  const providerIds = cbsaProviders.map(p => p.provider_id)
  const { data: providerNames } = await supabase
    .from('fcc_providers')
    .select('provider_id, name')
    .in('provider_id', providerIds)

  const nameMap = new Map(providerNames?.map(p => [p.provider_id, p.name]) || [])

  const providers = cbsaProviders.map(p => {
    const name = nameMap.get(p.provider_id) || 'Unknown'
    const lowerName = name.toLowerCase()

    const technologies: string[] = []

    // Fiber providers - be specific about Verizon (only Fios is fiber)
    if (lowerName.includes('fios')) {
      technologies.push('Fiber')
    }
    if (lowerName.includes('google fiber') || (lowerName.includes('google') && !lowerName.includes('google fiber'))) {
      technologies.push('Fiber')
    }
    if (lowerName.includes('frontier') && (lowerName.includes('fiber') || lowerName.includes('fios'))) {
      technologies.push('Fiber')
    }
    if (lowerName.includes('at&t') && !lowerName.includes('wireless')) {
      technologies.push('Fiber', 'DSL')
    }
    if (lowerName.includes('centurylink') || lowerName.includes('lumen')) {
      technologies.push('Fiber', 'DSL')
    }

    // Cable providers
    if (lowerName.includes('comcast') || lowerName.includes('xfinity') || lowerName.includes('spectrum') || lowerName.includes('cox') || lowerName.includes('charter') || lowerName.includes('optimum') || lowerName.includes('altice')) {
      technologies.push('Cable')
    }

    // 5G/Fixed Wireless providers
    if (lowerName.includes('t-mobile')) {
      technologies.push('5G')
    }
    if (lowerName.includes('verizon') && !lowerName.includes('fios')) {
      // Verizon without Fios is likely 5G Home or wireless
      technologies.push('5G')
    }

    // Satellite providers
    if (lowerName.includes('starlink') || lowerName.includes('viasat') || lowerName.includes('hughesnet') || lowerName.includes('echostar')) {
      technologies.push('Satellite')
    }

    // DSL-only providers (legacy)
    if (lowerName.includes('frontier') && !lowerName.includes('fiber') && !lowerName.includes('fios') && technologies.length === 0) {
      technologies.push('DSL')
    }

    if (technologies.length === 0) {
      technologies.push('Internet')
    }

    const displayName = name
      .replace(/, Inc\.|Inc\.|Corporation|Corp\.|LLC/g, '')
      .replace('Charter Communications', 'Spectrum')
      .replace('Comcast Cable', 'Xfinity')
      .replace('Space Exploration Technologies', 'Starlink')
      .trim()

    return {
      name: displayName,
      technologies: [...new Set(technologies)],
      coverage_pct: Math.round(p.coverage_pct * 100),
    }
  })

  // Sort by technology priority: Fiber > Cable > 5G > DSL > Satellite > Internet
  const techPriority: Record<string, number> = {
    'Fiber': 1,
    'Cable': 2,
    '5G': 3,
    'DSL': 4,
    'Satellite': 5,
    'Internet': 6,
  }

  return providers.sort((a, b) => {
    // Get the best (lowest) priority for each provider
    const aPriority = Math.min(...a.technologies.map(t => techPriority[t] || 6))
    const bPriority = Math.min(...b.technologies.map(t => techPriority[t] || 6))

    // Sort by tech priority first, then by coverage within same tech
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }
    return b.coverage_pct - a.coverage_pct
  })
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const { zip } = await searchParams

  const template = guideTemplates[slug]
  if (!template) {
    return { title: 'Guide Not Found' }
  }

  const locationInfo = zip ? await getLocationInfo(zip) : { city: 'Your Area' }

  return {
    title: template.title(locationInfo.city),
    description: template.description(locationInfo.city),
  }
}

export default async function GuidePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { zip } = await searchParams

  const template = guideTemplates[slug]
  if (!template) {
    notFound()
  }

  const zipCode = zip || ''
  const locationInfo = zipCode ? await getLocationInfo(zipCode) : { city: 'Your Area', cbsaCode: null }
  const allProviders = zipCode ? await getProviders(zipCode) : []

  const providers = template.filterProviders
    ? template.filterProviders(allProviders)
    : allProviders

  const categoryInfo = categoryConfig[template.category] || {
    label: template.category,
    gradient: 'from-gray-500 to-gray-600',
    Icon: Wifi,
  }

  const { Icon, gradient, label } = categoryInfo

  // Get related guides (other guides, excluding current)
  const relatedGuides = Object.entries(guideTemplates)
    .filter(([key]) => key !== slug)
    .slice(0, 4)
    .map(([key, t]) => ({
      slug: key,
      category: t.category,
      title: t.title('').replace(' in ', ''),
    }))

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-800/50">
        {/* Background effects */}
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-3xl`} />
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-4xl mx-auto">
            {/* Category Badge with Icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-lg opacity-50`} />
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${gradient} text-white`}>
                  {label}
                </span>
                {zipCode && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{zipCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {template.title(locationInfo.city)}
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-400 mb-8 max-w-3xl">
              {template.description(locationInfo.city)}
            </p>

            {/* Quick Stats */}
            {zipCode && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Signal className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-gray-400">Providers</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{allProviders.length}</div>
                </div>
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-gray-400">Fiber</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {allProviders.filter(p => p.technologies.includes('Fiber')).length}
                  </div>
                </div>
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Wifi className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-400">Cable</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {allProviders.filter(p => p.technologies.includes('Cable')).length}
                  </div>
                </div>
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-400">Location</span>
                  </div>
                  <div className="text-lg font-bold text-white truncate">{locationInfo.city}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Dynamic Guide Content */}
          <GuideContent
            slug={slug}
            city={locationInfo.city}
            zipCode={zipCode}
            providers={providers}
            allProviders={allProviders}
            gradient={gradient}
          />

          {/* No ZIP Warning */}
          {!zipCode && (
            <div className="relative bg-gray-900/60 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-8 mb-10 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">See Providers in Your Area</h3>
                    <p className="text-sm text-gray-400">Enter your ZIP code for personalized recommendations</p>
                  </div>
                </div>
                <Link
                  href="/"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Enter ZIP Code
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Providers Section */}
          {zipCode && providers.length > 0 && (
            <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-10 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="relative">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {template.filterProviders ? 'Recommended Providers' : 'Available Providers'}
                  </span>
                  <span className="text-gray-400"> in {locationInfo.city}</span>
                </h2>

                <div className="space-y-3">
                  {providers.slice(0, 6).map((provider, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold text-white">{provider.name}</h3>
                        <div className="flex gap-2 mt-2">
                          {provider.technologies.map((tech) => {
                            const techGradients: Record<string, string> = {
                              'Fiber': 'from-green-500 to-emerald-500',
                              'Cable': 'from-blue-500 to-cyan-500',
                              '5G': 'from-purple-500 to-pink-500',
                              'DSL': 'from-orange-500 to-amber-500',
                              'Satellite': 'from-indigo-500 to-purple-500',
                            }
                            return (
                              <span
                                key={tech}
                                className={`px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r ${techGradients[tech] || 'from-gray-500 to-gray-600'} text-white`}
                              >
                                {tech}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-cyan-400">{provider.coverage_pct}%</div>
                        <div className="text-xs text-gray-500">coverage</div>
                      </div>
                    </div>
                  ))}
                </div>

                {providers.length > 6 && (
                  <div className="text-center mt-6">
                    <Link
                      href={`/compare?zip=${zipCode}`}
                      className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors inline-flex items-center gap-1"
                    >
                      View all {allProviders.length} providers
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTA Section */}
          {zipCode && (
            <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-10 text-center mb-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/10 blur-3xl" />

              <div className="relative">
                <h2 className="text-3xl font-bold mb-3">
                  <span className="text-white">Compare All Providers</span>
                </h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  See detailed plans, pricing, and real availability for your exact address in {locationInfo.city}.
                </p>
                <Link
                  href={`/compare?zip=${zipCode}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/25"
                >
                  View All {allProviders.length} Providers
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}

          {/* Related Guides */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                More Guides
              </span>
              {zipCode && <span className="text-gray-400"> for {locationInfo.city}</span>}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedGuides.map((guide) => {
                const config = categoryConfig[guide.category] || categoryConfig['comparison']
                const GuideIcon = config.Icon

                return (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}${zipCode ? `?zip=${zipCode}` : ''}`}
                    className="group flex items-center gap-4 p-4 bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
                      <GuideIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white group-hover:text-cyan-400 transition-colors truncate">
                        {guide.title}
                      </div>
                      <div className="text-xs text-gray-500">{config.label}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
