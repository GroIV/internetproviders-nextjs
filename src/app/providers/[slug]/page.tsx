import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LocationInfo } from '@/components/LocationInfo'
import { getProviderCoverageCount } from '@/lib/getProvidersByLocation'
import { OrderButton } from '@/components/OrderButton'
import { hasAffiliateLink } from '@/lib/affiliates'
import { ProviderPlansSection, TVPlansSection } from '@/components/plans'
import { getFeaturedPlansForProvider } from '@/lib/featuredPlans'
import { ProviderLogo } from '@/components/ProviderLogo'
import {
  JsonLd,
  generateBreadcrumbSchema,
  generateProviderSchema,
} from '@/lib/seo'

// Provider details for enhanced display
const providerDetails: Record<string, { maxSpeed: string; speedMbps: number; startingPrice: string; color: string; description: string }> = {
  'xfinity': { maxSpeed: '2 Gbps', speedMbps: 2000, startingPrice: '$30', color: 'from-purple-500 to-blue-500', description: 'Leading cable and fiber provider with extensive nationwide coverage' },
  'spectrum': { maxSpeed: '1 Gbps', speedMbps: 1000, startingPrice: '$50', color: 'from-blue-500 to-cyan-500', description: 'Major cable provider known for no contracts and reliable service' },
  'att-internet': { maxSpeed: '5 Gbps', speedMbps: 5000, startingPrice: '$55', color: 'from-cyan-500 to-blue-500', description: 'Nationwide fiber and DSL provider with extensive coverage' },
  'verizon-fios': { maxSpeed: '2.3 Gbps', speedMbps: 2300, startingPrice: '$50', color: 'from-red-500 to-pink-500', description: 'Premium fiber provider with symmetrical upload/download speeds' },
  'google-fiber': { maxSpeed: '8 Gbps', speedMbps: 8000, startingPrice: '$70', color: 'from-green-500 to-blue-500', description: 'Ultra-fast fiber in select cities with simple pricing' },
  'frontier': { maxSpeed: '5 Gbps', speedMbps: 5000, startingPrice: '$50', color: 'from-red-600 to-orange-500', description: 'Growing fiber network with competitive pricing' },
  'cox': { maxSpeed: '2 Gbps', speedMbps: 2000, startingPrice: '$50', color: 'from-blue-600 to-indigo-500', description: 'Regional cable and fiber provider with strong coverage' },
  't-mobile': { maxSpeed: '245 Mbps', speedMbps: 245, startingPrice: '$50', color: 'from-pink-500 to-purple-500', description: '5G home internet with no annual contracts' },
  'starlink': { maxSpeed: '220 Mbps', speedMbps: 220, startingPrice: '$120', color: 'from-slate-500 to-zinc-400', description: 'Revolutionary satellite internet available virtually anywhere' },
  'viasat': { maxSpeed: '150 Mbps', speedMbps: 150, startingPrice: '$70', color: 'from-blue-700 to-blue-500', description: 'Satellite internet for rural and remote areas' },
  'centurylink': { maxSpeed: '940 Mbps', speedMbps: 940, startingPrice: '$50', color: 'from-green-600 to-emerald-500', description: 'Fiber and DSL provider with price-for-life guarantee' },
  'optimum': { maxSpeed: '8 Gbps', speedMbps: 8000, startingPrice: '$40', color: 'from-amber-500 to-yellow-500', description: 'Cable and fiber provider in the Northeast' },
  'breezeline': { maxSpeed: '1 Gbps', speedMbps: 1000, startingPrice: '$50', color: 'from-cyan-400 to-teal-500', description: 'Regional cable provider focused on customer service' },
  'metronet': { maxSpeed: '5 Gbps', speedMbps: 5000, startingPrice: '$50', color: 'from-green-500 to-emerald-400', description: '100% fiber provider expanding across the Midwest' },
  'ziply-fiber': { maxSpeed: '5 Gbps', speedMbps: 5000, startingPrice: '$20', color: 'from-green-400 to-cyan-500', description: 'Northwest fiber provider with affordable plans' },
  'brightspeed': { maxSpeed: '2 Gbps', speedMbps: 2000, startingPrice: '$50', color: 'from-orange-500 to-red-500', description: 'Fiber and DSL provider in the South and Midwest' },
  'windstream': { maxSpeed: '2 Gbps', speedMbps: 2000, startingPrice: '$40', color: 'from-blue-500 to-purple-500', description: 'Kinetic fiber and DSL service in rural areas' },
  'wow': { maxSpeed: '1 Gbps', speedMbps: 1000, startingPrice: '$40', color: 'from-orange-500 to-amber-500', description: 'Regional cable provider with no contracts' },
  'astound-broadband': { maxSpeed: '1.5 Gbps', speedMbps: 1500, startingPrice: '$25', color: 'from-blue-500 to-indigo-500', description: 'Cable and fiber provider in select markets' },
  'directv': { maxSpeed: 'N/A', speedMbps: 0, startingPrice: '$65', color: 'from-blue-600 to-cyan-500', description: 'Satellite TV with streaming options' },
  'dish': { maxSpeed: 'N/A', speedMbps: 0, startingPrice: '$80', color: 'from-red-600 to-rose-500', description: 'Satellite TV with flexible packages' },
}

// Calculate speed percentage on logarithmic scale
const getSpeedPercent = (speedMbps: number): number => {
  if (speedMbps === 0) return 0
  const maxSpeed = 8000
  const logPercent = (Math.log10(speedMbps + 1) / Math.log10(maxSpeed + 1)) * 100
  return Math.min(Math.max(logPercent, 5), 100)
}

// Technology gradient colors
const techColors: Record<string, string> = {
  'Fiber': 'from-cyan-500 to-blue-500',
  'Cable': 'from-blue-500 to-indigo-500',
  'DSL': 'from-amber-500 to-orange-500',
  '5G': 'from-purple-500 to-pink-500',
  'Fixed Wireless': 'from-green-500 to-teal-500',
  'Satellite': 'from-slate-500 to-zinc-400',
}

interface Props {
  params: Promise<{ slug: string }>
}

async function getProvider(slug: string) {
  const supabase = createAdminClient()

  const { data: provider, error } = await supabase
    .from('providers')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !provider) {
    return null
  }

  // Get coverage count by matching to FCC provider data
  const coverageCount = await getProviderCoverageCount(provider.name)

  return { ...provider, coverageCount }
}

// Get related providers based on technology or category
async function getRelatedProviders(currentSlug: string, technologies: string[], category: string) {
  const supabase = createAdminClient()

  const { data: providers } = await supabase
    .from('providers')
    .select('slug, name, technologies, category')
    .neq('slug', currentSlug)
    .limit(6)

  if (!providers) return []

  // Score providers by relevance
  const scored = providers.map(p => {
    let score = 0
    // Same category (e.g., both TV providers)
    if (p.category === category) score += 3
    // Shared technologies
    const sharedTechs = (p.technologies || []).filter((t: string) => technologies.includes(t))
    score += sharedTechs.length * 2
    return { ...p, score }
  })

  // Sort by score and return top 4
  return scored.sort((a, b) => b.score - a.score).slice(0, 4)
}

// Define popular comparison pairs
const comparisonPairs: Record<string, string[]> = {
  'xfinity': ['spectrum', 'att-internet', 'verizon-fios'],
  'spectrum': ['xfinity', 'att-internet', 'cox'],
  'att-internet': ['xfinity', 'spectrum', 'verizon-fios'],
  'verizon-fios': ['xfinity', 'att-internet', 'frontier'],
  'cox': ['xfinity', 'spectrum', 'att-internet'],
  'frontier': ['att-internet', 'centurylink', 'verizon-fios'],
  'google-fiber': ['att-internet', 'verizon-fios', 'frontier'],
  't-mobile': ['verizon-fios', 'xfinity', 'starlink'],
  'directv': ['dish', 'xfinity', 'spectrum'],
  'dish': ['directv', 'xfinity', 'spectrum'],
  'starlink': ['viasat', 't-mobile', 'dish'],
  'viasat': ['starlink', 'dish', 't-mobile'],
  'breezeline': ['xfinity', 'spectrum', 'cox'],
  'astound-broadband': ['xfinity', 'spectrum', 'cox'],
  'centurylink': ['frontier', 'att-internet', 'brightspeed'],
  'brightspeed': ['centurylink', 'frontier', 'att-internet'],
  'altafiber': ['att-internet', 'spectrum', 'frontier'],
  'buckeye-cable': ['spectrum', 'att-internet', 'wow'],
  'consolidated-communications': ['frontier', 'centurylink', 'att-internet'],
  'metronet': ['google-fiber', 'att-internet', 'frontier'],
  'wow': ['spectrum', 'xfinity', 'breezeline'],
  'optimum': ['xfinity', 'verizon-fios', 'spectrum'],
  'windstream': ['centurylink', 'frontier', 'att-internet'],
  'ziply-fiber': ['centurylink', 'frontier', 'xfinity'],
  'tds-telecom': ['centurylink', 'frontier', 'windstream'],
}

// Map database provider slugs to featured plans slugs
function getFeaturedPlanSlug(dbSlug: string): string {
  const slugMap: Record<string, string> = {
    'frontier': 'frontier-fiber',
    'att': 'att-internet',
    'spectrum': 'spectrum',
    't-mobile': 't-mobile',
    'tmobile': 't-mobile',
    'wow': 'wow',
    'google-fiber': 'google-fiber',
    'starlink': 'starlink',
    'viasat': 'viasat',
    'xfinity': 'xfinity',
    'cox': 'cox',
    'breezeline': 'breezeline',
    'astound-broadband': 'astound-broadband',
    'consolidated-communications': 'consolidated-communications',
    'buckeye-cable': 'buckeye-cable',
    'brightspeed': 'brightspeed',
    'centurylink': 'centurylink',
    'altafiber': 'altafiber',
    'metronet': 'metronet',
    'verizon-fios': 'verizon-fios',
    'optimum': 'optimum',
    'windstream': 'windstream',
    'ziply-fiber': 'ziply-fiber',
    'tds-telecom': 'tds-telecom',
  }
  return slugMap[dbSlug] || dbSlug
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const provider = await getProvider(slug)

  if (!provider) {
    return { title: 'Provider Not Found' }
  }

  const technologies = provider.technologies || []
  const techString = technologies.length > 0 ? technologies.join(', ') : 'high-speed internet'

  return {
    title: `${provider.name} Internet Plans & Pricing`,
    description: `Compare ${provider.name} internet plans, pricing, and availability. ${provider.name} offers ${techString} service in ${provider.coverageCount.toLocaleString()} ZIP codes.`,
    alternates: {
      canonical: `/providers/${slug}`,
    },
    openGraph: {
      title: `${provider.name} Internet Plans & Pricing`,
      description: `Compare ${provider.name} internet plans, pricing, and availability. Find the best ${provider.name} deals in your area.`,
      url: `/providers/${slug}`,
      type: 'website',
    },
  }
}

export default async function ProviderPage({ params }: Props) {
  const { slug } = await params
  const provider = await getProvider(slug)

  if (!provider) {
    notFound()
  }

  const technologies = provider.technologies || []

  // Get featured plans data for this provider
  const featuredPlanSlug = getFeaturedPlanSlug(slug)
  const providerPlans = getFeaturedPlansForProvider(featuredPlanSlug)

  // Get related providers for internal linking
  const relatedProviders = await getRelatedProviders(slug, technologies, provider.category || '')
  const comparisonSlugs = comparisonPairs[slug] || []

  // Calculate stats from featured plans
  const startingPrice = providerPlans?.plans.length
    ? Math.min(...providerPlans.plans.map(p => p.price))
    : null
  const maxSpeed = providerPlans?.plans.length
    ? Math.max(...providerPlans.plans.map(p => p.downloadSpeed))
    : null

  // Format max speed display
  const formatMaxSpeed = (speed: number | null) => {
    if (!speed) return technologies.includes('Fiber') ? '5 Gbps' : '1 Gbps'
    if (speed >= 1000) return `${(speed / 1000).toFixed(speed >= 10000 ? 0 : 1)} Gbps`
    return `${speed} Mbps`
  }

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Providers', url: '/providers' },
    { name: provider.name, url: `/providers/${slug}` },
  ])

  const providerSchema = generateProviderSchema({
    name: provider.name,
    slug: provider.slug,
    description: `${provider.name} is an internet service provider offering ${technologies.join(', ') || 'internet'} service across the United States.`,
    technologies: technologies,
    category: provider.category || 'Internet',
  })

  // Get provider-specific details
  const details = providerDetails[slug] || {
    maxSpeed: formatMaxSpeed(maxSpeed),
    speedMbps: maxSpeed || 500,
    startingPrice: startingPrice ? `$${startingPrice}` : '$50',
    color: 'from-gray-500 to-gray-600',
    description: `${provider.name} provides internet service across the United States.`
  }
  const speedPercent = getSpeedPercent(details.speedMbps)
  const isTV = provider.category === 'TV' || provider.category === 'Satellite TV'

  return (
    <>
      <JsonLd data={[breadcrumbSchema, providerSchema]} />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <Link href="/providers" className="hover:text-cyan-400 transition-colors">Providers</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-white font-medium">{provider.name}</span>
          </nav>

        {/* Enhanced Header */}
        <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50 overflow-hidden group">
          {/* Background gradient glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${details.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
          <div className={`absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br ${details.color} rounded-full blur-3xl opacity-20`} />

          <div className="relative flex flex-col md:flex-row items-start gap-6">
            {/* Large Provider Logo */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${details.color} rounded-2xl blur-lg opacity-50`} />
              <ProviderLogo slug={slug} name={provider.name} size="xl" className="relative shadow-xl" />
            </div>

            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {provider.name}
                  </h1>
                  <p className="text-gray-400 text-lg mb-3">{details.description}</p>

                  {/* Tech badges with gradients */}
                  {technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {technologies.map((tech: string) => (
                        <span
                          key={tech}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${techColors[tech] || 'from-gray-500 to-gray-600'} text-white shadow-lg`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <OrderButton
                    providerId={slug}
                    providerName={provider.name}
                    size="lg"
                  />
                  {/* Coverage badge */}
                  <div className="flex items-center gap-2 text-sm text-gray-400 justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{provider.coverageCount.toLocaleString()} ZIP codes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Max Speed */}
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm text-gray-400">Max Speed</span>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {details.maxSpeed}
              </div>
              {/* Speed bar */}
              {!isTV && (
                <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${details.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${speedPercent}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Starting Price */}
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 overflow-hidden group hover:border-green-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-400">Starting Price</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {details.startingPrice}<span className="text-sm font-normal text-gray-400">/mo*</span>
              </div>
            </div>
          </div>

          {/* Coverage */}
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-400">Coverage</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {provider.coverageCount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">ZIP codes served</div>
            </div>
          </div>

          {/* Plans Available */}
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm text-gray-400">Available Plans</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {providerPlans ? providerPlans.plans.length : '-'}
              </div>
              <div className="text-xs text-gray-500">featured plans</div>
            </div>
          </div>
        </div>

        {/* Check Availability */}
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${details.color} opacity-5`} />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-20" />
          <div className="relative">
            <h2 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Check {provider.name} Availability
            </h2>
            <p className="text-gray-400 text-center mb-6">
              See if {provider.name} is available at your address
            </p>
            <LocationInfo message={`Checking ${provider.name} availability`} />

            {/* Check Availability Button */}
            {hasAffiliateLink(slug) && (
              <div className="mt-6 text-center">
                <Link
                  href={`/go/${slug}?source=${slug}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Check {provider.name} Availability
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Featured Plans Section */}
        <ProviderPlansSection
          providerSlug={getFeaturedPlanSlug(slug)}
          providerName={provider.name}
        />

        {/* TV Plans Section (for TV providers like DIRECTV, DISH) */}
        <TVPlansSection
          providerName={provider.name}
          providerSlug={slug}
        />

        {/* About Section */}
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-10" />
          <div className="relative">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              About {provider.name}
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed">
                {provider.name} is a leading internet service provider offering
                {technologies.length > 0 ? ` ${technologies.join(', ')}` : ' high-speed internet'} service
                across the United States. With coverage in {provider.coverageCount.toLocaleString()} ZIP codes,
                {provider.name} provides reliable internet connectivity for homes and businesses.
              </p>

              {technologies.includes('Fiber') && (
                <p className="text-gray-300 mt-4 leading-relaxed">
                  As a fiber internet provider, {provider.name} offers some of the fastest speeds available,
                  with symmetrical upload and download speeds perfect for streaming, gaming, and working from home.
                </p>
              )}

              {technologies.includes('Satellite') && (
                <p className="text-gray-300 mt-4 leading-relaxed">
                  {provider.name}&apos;s satellite internet service is available virtually anywhere in the continental
                  United States, making it an excellent option for rural areas where other types of internet
                  service may not be available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Technologies */}
        {technologies.length > 0 && (
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50 overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full blur-3xl opacity-10" />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Available Technologies
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {technologies.map((tech: string) => {
                  const gradientColor = techColors[tech] || 'from-gray-500 to-gray-600'
                  return (
                    <div key={tech} className="flex items-start gap-4 p-5 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors group">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        {tech === 'Fiber' && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        {tech === 'Cable' && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        )}
                        {tech === 'Satellite' && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {tech === '5G' && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                          </svg>
                        )}
                        {tech === 'DSL' && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        )}
                        {tech === 'Fixed Wireless' && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{tech}</h3>
                        <p className="text-sm text-gray-400">
                          {tech === 'Fiber' && 'Ultra-fast symmetrical speeds up to 8 Gbps'}
                          {tech === 'Cable' && 'Reliable high-speed internet up to 2 Gbps'}
                          {tech === 'DSL' && 'Widely available internet over phone lines'}
                          {tech === '5G' && 'Next-gen wireless technology with low latency'}
                          {tech === 'Fixed Wireless' && 'Wireless broadband for underserved areas'}
                          {tech === 'Satellite' && 'Available virtually anywhere in the US'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Compare With Section */}
        {comparisonSlugs.length > 0 && (
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-500 to-red-500 rounded-full blur-3xl opacity-10" />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Compare {provider.name}
              </h2>
              <p className="text-gray-400 mb-6">See how {provider.name} stacks up against other providers</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisonSlugs.map((compSlug) => {
                  const displayName = compSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                    .replace('Att', 'AT&T').replace('Directv', 'DIRECTV').replace('Verizon Fios', 'Verizon Fios')
                  const compDetails = providerDetails[compSlug] || { color: 'from-gray-500 to-gray-600' }
                  return (
                    <Link
                      key={compSlug}
                      href={`/compare/${slug}-vs-${compSlug}`}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-orange-500/30 transition-all group hover:shadow-lg hover:shadow-orange-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <ProviderLogo slug={slug} name={provider.name} size="sm" className="shadow-lg" />
                          <ProviderLogo slug={compSlug} name={displayName} size="sm" className="shadow-lg" />
                        </div>
                        <span className="font-medium text-gray-300 group-hover:text-orange-400 transition-colors">
                          vs {displayName}
                        </span>
                      </div>
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Related Providers */}
        {relatedProviders.length > 0 && (
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50 overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-10" />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Similar Providers
              </h2>
              <p className="text-gray-400 mb-6">Other providers you might want to consider</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProviders.map((p) => {
                  const relatedDetails = providerDetails[p.slug] || { color: 'from-gray-500 to-gray-600' }
                  return (
                    <Link
                      key={p.slug}
                      href={`/providers/${p.slug}`}
                      className="relative p-5 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all group text-center hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
                    >
                      <div className="relative mx-auto mb-3">
                        <div className={`absolute inset-0 bg-gradient-to-br ${relatedDetails.color} rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity`} />
                        <ProviderLogo slug={p.slug} name={p.name} size="lg" className="relative shadow-lg mx-auto" />
                      </div>
                      <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">{p.name}</h3>
                      {p.technologies && p.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                          {p.technologies.slice(0, 2).map((tech: string) => (
                            <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-10 border border-gray-700/50 overflow-hidden text-center">
          {/* Background effects */}
          <div className={`absolute inset-0 bg-gradient-to-br ${details.color} opacity-5`} />
          <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-gradient-to-br ${details.color} rounded-full blur-3xl opacity-20`} />

          <div className="relative">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
              {hasAffiliateLink(slug)
                ? `Order ${provider.name} today and enjoy fast, reliable internet service`
                : `Check if ${provider.name} is available at your address`
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <OrderButton
                providerId={slug}
                providerName={provider.name}
                size="lg"
              />
              <Link
                href={`/compare`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl text-lg font-medium hover:bg-gray-700 transition-all border border-gray-700 hover:border-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare All Providers
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
