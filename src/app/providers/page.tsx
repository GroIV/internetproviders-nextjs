import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Internet Providers',
  description: 'Browse all internet service providers. Compare fiber, cable, DSL, and satellite providers nationwide.',
}

const technologyColors: Record<string, string> = {
  'Fiber': 'bg-green-600/20 text-green-400',
  'Cable': 'bg-blue-600/20 text-blue-400',
  'DSL': 'bg-yellow-600/20 text-yellow-400',
  '5G': 'bg-purple-600/20 text-purple-400',
  'Fixed Wireless': 'bg-cyan-600/20 text-cyan-400',
  'Satellite': 'bg-orange-600/20 text-orange-400',
}

async function getProviders() {
  const supabase = createAdminClient()

  const { data: providers, error } = await supabase
    .from('providers')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching providers:', error)
    return []
  }

  return providers || []
}

export default async function ProvidersPage() {
  const providers = await getProviders()

  // Group by technology type
  const fiberProviders = providers.filter(p => p.technologies?.includes('Fiber'))
  const cableProviders = providers.filter(p => p.technologies?.includes('Cable'))
  const satelliteProviders = providers.filter(p => p.technologies?.includes('Satellite'))
  const tvProviders = providers.filter(p => p.category === 'TV' || p.category === 'Satellite TV')
  const otherProviders = providers.filter(p =>
    !p.technologies?.includes('Fiber') &&
    !p.technologies?.includes('Cable') &&
    !p.technologies?.includes('Satellite') &&
    p.category !== 'TV' &&
    p.category !== 'Satellite TV'
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Internet Providers</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Compare the top internet service providers in the United States
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{providers.length}</div>
            <div className="text-sm text-gray-400">Total Providers</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{fiberProviders.length}</div>
            <div className="text-sm text-gray-400">Fiber Providers</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{cableProviders.length}</div>
            <div className="text-sm text-gray-400">Cable Providers</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{satelliteProviders.length}</div>
            <div className="text-sm text-gray-400">Satellite Providers</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{tvProviders.length}</div>
            <div className="text-sm text-gray-400">TV Providers</div>
          </div>
        </div>

        {/* TV Providers Section */}
        {tvProviders.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              TV Providers
              <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-sm rounded">Satellite TV</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {tvProviders.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/providers/${provider.slug}`}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-600/50 transition-colors group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center text-xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                      {provider.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-purple-400 transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-gray-400">{provider.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {provider.name === 'DIRECTV' && 'Satellite TV packages with 175+ channels'}
                    {provider.name === 'DISH Network' && 'Satellite TV packages starting at $83.99/mo'}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* All Providers Grid */}
        <h2 className="text-2xl font-semibold mb-6">All Providers</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {providers.map((provider) => (
            <Link
              key={provider.id}
              href={`/providers/${provider.slug}`}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-600/50 transition-colors group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
                  {provider.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-gray-400">{provider.category}</p>
                </div>
              </div>

              {provider.technologies && provider.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {provider.technologies.map((tech: string) => (
                    <span
                      key={tech}
                      className={`px-2 py-1 rounded text-xs font-medium ${technologyColors[tech] || 'bg-gray-600/20 text-gray-400'}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Find Providers in Your Area</h2>
          <p className="text-gray-400 mb-6">Enter your ZIP code to see which providers service your address</p>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Search by ZIP Code
          </Link>
        </div>
      </div>
    </div>
  )
}
