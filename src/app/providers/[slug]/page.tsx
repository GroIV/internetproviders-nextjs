import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LocationInfo } from '@/components/LocationInfo'

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

  // Get coverage count
  const { count } = await supabase
    .from('coverage')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', provider.id)

  return { ...provider, coverageCount: count || 0 }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const provider = await getProvider(slug)

  if (!provider) {
    return { title: 'Provider Not Found' }
  }

  return {
    title: `${provider.name} Internet Plans & Pricing`,
    description: `Compare ${provider.name} internet plans, pricing, and availability. Find the best ${provider.name} deals in your area.`,
  }
}

export default async function ProviderPage({ params }: Props) {
  const { slug } = await params
  const provider = await getProvider(slug)

  if (!provider) {
    notFound()
  }

  const technologies = provider.technologies || []

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
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
              <h1 className="text-3xl font-bold mb-2">{provider.name}</h1>
              <p className="text-gray-400 mb-4">{provider.category}</p>

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
            <div className="text-2xl font-bold text-green-400">$30</div>
            <div className="text-sm text-gray-400">Starting Price*</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {technologies.includes('Fiber') ? '5 Gbps' : '1 Gbps'}
            </div>
            <div className="text-sm text-gray-400">Max Speed</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">4.2</div>
            <div className="text-sm text-gray-400">Avg Rating</div>
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

        {/* CTA */}
        <div className="text-center">
          <Link
            href={`/compare?zip=`}
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Check Availability in Your Area
          </Link>
        </div>
      </div>
    </div>
  )
}
