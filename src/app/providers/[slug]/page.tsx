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
import {
  JsonLd,
  generateBreadcrumbSchema,
  generateProviderSchema,
} from '@/lib/seo'

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

  return (
    <>
      <JsonLd data={[breadcrumbSchema, providerSchema]} />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/providers" className="hover:text-white">Providers</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{provider.name}</span>
          </nav>

        {/* Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-gray-800 flex items-center justify-center text-3xl font-bold text-blue-400">
              {provider.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{provider.name}</h1>
                  <p className="text-gray-400">{provider.category}</p>
                </div>
                <OrderButton
                  providerId={slug}
                  providerName={provider.name}
                  size="lg"
                />
              </div>

              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech: string) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-blue-600/20 text-blue-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {provider.coverageCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">ZIP Codes</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {startingPrice ? `$${startingPrice}` : '$30'}
            </div>
            <div className="text-sm text-gray-400">Starting Price*</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {formatMaxSpeed(maxSpeed)}
            </div>
            <div className="text-sm text-gray-400">Max Speed</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {providerPlans ? providerPlans.plans.length : '-'}
            </div>
            <div className="text-sm text-gray-400">Featured Plans</div>
          </div>
        </div>

        {/* Check Availability */}
        <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Check {provider.name} Availability</h2>
          <p className="text-gray-400 text-center mb-6">
            See if {provider.name} is available at your address
          </p>
          <LocationInfo message={`Checking ${provider.name} availability`} />
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
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">About {provider.name}</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">
              {provider.name} is a leading internet service provider offering
              {technologies.length > 0 ? ` ${technologies.join(', ')}` : ' high-speed internet'} service
              across the United States. With coverage in {provider.coverageCount.toLocaleString()} ZIP codes,
              {provider.name} provides reliable internet connectivity for homes and businesses.
            </p>

            {technologies.includes('Fiber') && (
              <p className="text-gray-300 mt-4">
                As a fiber internet provider, {provider.name} offers some of the fastest speeds available,
                with symmetrical upload and download speeds perfect for streaming, gaming, and working from home.
              </p>
            )}

            {technologies.includes('Satellite') && (
              <p className="text-gray-300 mt-4">
                {provider.name}'s satellite internet service is available virtually anywhere in the continental
                United States, making it an excellent option for rural areas where other types of internet
                service may not be available.
              </p>
            )}
          </div>
        </div>

        {/* Technologies */}
        {technologies.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Available Technologies</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {technologies.map((tech: string) => (
                <div key={tech} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    {tech === 'Fiber' && (
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {tech === 'Cable' && (
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    )}
                    {tech === 'Satellite' && (
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {!['Fiber', 'Cable', 'Satellite'].includes(tech) && (
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{tech}</h3>
                    <p className="text-sm text-gray-400">
                      {tech === 'Fiber' && 'Ultra-fast symmetrical speeds up to 5 Gbps'}
                      {tech === 'Cable' && 'Reliable high-speed internet up to 1 Gbps'}
                      {tech === 'DSL' && 'Widely available internet over phone lines'}
                      {tech === '5G' && 'Next-gen wireless technology with low latency'}
                      {tech === 'Fixed Wireless' && 'Wireless broadband for rural areas'}
                      {tech === 'Satellite' && 'Available virtually anywhere in the US'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compare With Section */}
        {comparisonSlugs.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Compare {provider.name}</h2>
            <p className="text-gray-400 mb-6">See how {provider.name} stacks up against other providers</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {comparisonSlugs.map((compSlug) => {
                const displayName = compSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                  .replace('Att', 'AT&T').replace('Directv', 'DIRECTV').replace('Verizon Fios', 'Verizon Fios')
                return (
                  <Link
                    key={compSlug}
                    href={`/compare/${slug}-vs-${compSlug}`}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
                  >
                    <span className="font-medium group-hover:text-blue-400 transition-colors">
                      {provider.name} vs {displayName}
                    </span>
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Related Providers */}
        {relatedProviders.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Similar Providers</h2>
            <p className="text-gray-400 mb-6">Other providers you might want to consider</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProviders.map((p) => (
                <Link
                  key={p.slug}
                  href={`/providers/${p.slug}`}
                  className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:text-blue-400 transition-colors mx-auto mb-3">
                    {p.name.charAt(0)}
                  </div>
                  <h3 className="font-medium group-hover:text-blue-400 transition-colors">{p.name}</h3>
                  {p.technologies && p.technologies.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">{p.technologies.slice(0, 2).join(', ')}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-6">
            {hasAffiliateLink(slug)
              ? `Order ${provider.name} today or check availability in your area`
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
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-white rounded-lg text-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Compare All Providers
            </Link>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
