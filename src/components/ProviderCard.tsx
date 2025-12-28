import Link from 'next/link'
import { ProviderLogo } from './ProviderLogo'

interface Provider {
  id: number
  name: string
  slug: string
  category: string
  technologies: string[]
  logo?: string | null
}

interface ProviderCardProps {
  provider: Provider
  zipCode: string
}

const technologyColors: Record<string, string> = {
  'Fiber': 'bg-green-600/20 text-green-400 border-green-600/30',
  'Cable': 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  'DSL': 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
  '5G': 'bg-purple-600/20 text-purple-400 border-purple-600/30',
  'Fixed Wireless': 'bg-cyan-600/20 text-cyan-400 border-cyan-600/30',
  'Satellite': 'bg-orange-600/20 text-orange-400 border-orange-600/30',
}

export function ProviderCard({ provider, zipCode }: ProviderCardProps) {
  const technologies = provider.technologies || []

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {/* Provider Logo */}
            <ProviderLogo slug={provider.slug} name={provider.name} size="md" />
            <div>
              <h3 className="text-xl font-semibold">
                <Link href={`/providers/${provider.slug}`} className="hover:text-blue-400 transition-colors">
                  {provider.name}
                </Link>
              </h3>
              <p className="text-sm text-gray-400">{provider.category}</p>
            </div>
          </div>

          {/* Technologies */}
          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className={`px-2 py-1 rounded text-xs font-medium border ${technologyColors[tech] || 'bg-gray-600/20 text-gray-400 border-gray-600/30'}`}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Starting at</span>
              <div className="font-semibold text-white">$30/mo*</div>
            </div>
            <div>
              <span className="text-gray-500">Max Speed</span>
              <div className="font-semibold text-white">
                {technologies.includes('Fiber') ? 'Up to 5 Gbps' :
                 technologies.includes('Cable') ? 'Up to 1 Gbps' :
                 'Varies'}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Contract</span>
              <div className="font-semibold text-white">No Contract</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <Link
            href={`/providers/${provider.slug}?zip=${zipCode}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center whitespace-nowrap"
          >
            View Plans
          </Link>
          <Link
            href={`/providers/${provider.slug}`}
            className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:border-gray-600 hover:text-white transition-colors text-center whitespace-nowrap"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  )
}
