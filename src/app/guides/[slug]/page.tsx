import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

interface Guide {
  id: number
  guide_id: string
  title: string
  description: string
  category: string
  zip_code: string
  city: string
  state: string | null
  slug: string
  content: string | null
  publish_date: string
}

interface Provider {
  id: number
  name: string
  slug: string
  technologies: string[]
}

async function getGuide(slug: string) {
  const supabase = createAdminClient()

  const { data: guides, error } = await supabase
    .from('guides')
    .select('*')
    .eq('slug', slug)
    .limit(1)

  if (error || !guides || guides.length === 0) {
    return null
  }

  return guides[0] as Guide
}

async function getProvidersForZip(zipCode: string): Promise<Provider[]> {
  const supabase = createAdminClient()

  const { data: coverage } = await supabase
    .from('coverage')
    .select('provider_id')
    .eq('zip_code', zipCode)
    .eq('has_service', true)

  if (!coverage || coverage.length === 0) {
    return []
  }

  const providerIds = [...new Set(coverage.map(c => c.provider_id))]

  const { data: providers } = await supabase
    .from('providers')
    .select('id, name, slug, technologies')
    .in('id', providerIds)

  return (providers || []) as Provider[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuide(slug)

  if (!guide) {
    return { title: 'Guide Not Found' }
  }

  return {
    title: guide.title,
    description: guide.description,
  }
}

const categoryInfo: Record<string, { title: string; icon: string; color: string }> = {
  'budget': { title: 'Budget-Friendly Options', icon: '💰', color: 'text-green-400' },
  'speed': { title: 'Fastest Internet', icon: '⚡', color: 'text-yellow-400' },
  'gaming': { title: 'Best for Gaming', icon: '🎮', color: 'text-purple-400' },
  'streaming': { title: 'Best for Streaming', icon: '📺', color: 'text-blue-400' },
  'work-from-home': { title: 'Work From Home', icon: '💼', color: 'text-cyan-400' },
  'rural': { title: 'Rural Internet', icon: '🌾', color: 'text-orange-400' },
  'fiber': { title: 'Fiber Internet', icon: '🔌', color: 'text-emerald-400' },
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = await getGuide(slug)

  if (!guide) {
    notFound()
  }

  const providers = await getProvidersForZip(guide.zip_code)
  const category = categoryInfo[guide.category] || { title: guide.category, icon: '📖', color: 'text-gray-400' }

  // Filter providers based on category
  const relevantProviders = providers.filter(p => {
    if (guide.category === 'fiber') return p.technologies?.includes('Fiber')
    if (guide.category === 'budget') return true // All providers for budget
    if (guide.category === 'speed') return p.technologies?.includes('Fiber') || p.technologies?.includes('Cable')
    if (guide.category === 'gaming') return p.technologies?.includes('Fiber') || p.technologies?.includes('Cable')
    if (guide.category === 'rural') return p.technologies?.includes('Satellite') || p.technologies?.includes('Fixed Wireless')
    return true
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/guides" className="hover:text-white">Guides</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{guide.zip_code}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gray-800 ${category.color}`}>
              {category.icon} {category.title}
            </span>
            <span className="text-gray-500 text-sm">
              Updated {new Date(guide.publish_date).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{guide.title}</h1>
          <p className="text-xl text-gray-400">{guide.description}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{providers.length}</div>
            <div className="text-sm text-gray-400">Providers Available</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {providers.filter(p => p.technologies?.includes('Fiber')).length}
            </div>
            <div className="text-sm text-gray-400">Fiber Options</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{guide.zip_code}</div>
            <div className="text-sm text-gray-400">ZIP Code</div>
          </div>
        </div>

        {/* Custom Content or Generated Content */}
        {guide.content ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8 prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: guide.content }} />
          </div>
        ) : (
          <>
            {/* Generated Content */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Internet Options in {guide.zip_code}</h2>
              <p className="text-gray-300 mb-4">
                Looking for {category.title.toLowerCase()} internet in ZIP code {guide.zip_code}?
                We've analyzed the available providers to help you find the best option for your needs.
              </p>

              {guide.category === 'budget' && (
                <p className="text-gray-300">
                  When looking for affordable internet, consider providers offering promotional rates,
                  no-contract options, and basic speed tiers that meet your needs without overpaying
                  for speeds you won't use.
                </p>
              )}

              {guide.category === 'speed' && (
                <p className="text-gray-300">
                  For the fastest internet speeds, fiber-optic connections offer the best performance
                  with symmetrical upload and download speeds. Cable internet is a solid second choice
                  with speeds up to 1 Gbps in many areas.
                </p>
              )}

              {guide.category === 'gaming' && (
                <p className="text-gray-300">
                  Online gaming requires low latency (ping) more than raw speed. Fiber and cable
                  connections typically offer the best gaming experience with ping times under 20ms.
                  Avoid satellite if gaming is a priority.
                </p>
              )}

              {guide.category === 'rural' && (
                <p className="text-gray-300">
                  Rural areas often have limited wired internet options. Satellite internet
                  (HughesNet, Viasat, Starlink) and fixed wireless providers can deliver
                  broadband speeds where cable and fiber aren't available.
                </p>
              )}
            </div>

            {/* Available Providers */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {relevantProviders.length > 0 ? 'Recommended Providers' : 'All Available Providers'}
              </h2>

              {(relevantProviders.length > 0 ? relevantProviders : providers).length > 0 ? (
                <div className="space-y-4">
                  {(relevantProviders.length > 0 ? relevantProviders : providers).map((provider) => (
                    <Link
                      key={provider.id}
                      href={`/providers/${provider.slug}?zip=${guide.zip_code}`}
                      className="block p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{provider.name}</h3>
                          <div className="flex gap-2 mt-1">
                            {provider.technologies?.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  No providers found for this ZIP code. Try searching nearby areas.
                </p>
              )}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Compare All Providers in {guide.zip_code}</h2>
          <p className="text-gray-400 mb-6">
            See detailed plans, pricing, and availability for your address
          </p>
          <Link
            href={`/compare?zip=${guide.zip_code}`}
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View All {providers.length} Providers
          </Link>
        </div>

        {/* Related Guides */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">More Guides for {guide.zip_code}</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryInfo).map(([key, info]) => (
              key !== guide.category && (
                <Link
                  key={key}
                  href={`/guides?zip=${guide.zip_code}&category=${key}`}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition-colors"
                >
                  {info.icon} {info.title}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
