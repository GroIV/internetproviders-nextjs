'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { PanelWrapper } from './PanelWrapper'
import { useCommandCenter } from '@/contexts/CommandCenterContext'
import { ProviderLogo } from '@/components/ProviderLogo'

interface Provider {
  id: number
  name: string
  slug: string
  technologies: string[]
  coveragePercent: number
}

const techColors: Record<string, string> = {
  'Fiber': 'from-green-400 to-emerald-500',
  'Cable': 'from-blue-400 to-cyan-500',
  '5G': 'from-purple-400 to-pink-500',
  'DSL': 'from-yellow-400 to-amber-500',
  'Satellite': 'from-slate-400 to-gray-500',
  'Fixed Wireless': 'from-orange-400 to-red-500',
}

export function ProviderRecommendationsPanel({ data }: { data?: { zipCode?: string } }) {
  const { context, hidePanel } = useCommandCenter()
  const zipCode = data?.zipCode || context.zipCode
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!zipCode) return

    const fetchProviders = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/providers/list?zip=${zipCode}&limit=8`)
        const data = await res.json()
        if (data.success) {
          setProviders(data.providers)
        } else {
          setError('No providers found')
        }
      } catch {
        setError('Failed to load providers')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProviders()
  }, [zipCode])

  return (
    <PanelWrapper
      title={`Providers in ${zipCode || 'Your Area'}`}
      accentColor="blue"
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      }
      onClose={() => hidePanel(`recommendations-${Date.now()}`)}
    >
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-10 h-10 bg-gray-700 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-24 mb-2" />
                <div className="h-3 bg-gray-700 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-gray-400">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {providers.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/providers/${provider.slug}`}
                className="group flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 hover:bg-gray-800 transition-all"
              >
                <ProviderLogo slug={provider.slug} name={provider.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white group-hover:text-cyan-400 transition-colors truncate">
                    {provider.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {provider.technologies.slice(0, 2).map((tech) => (
                      <span
                        key={tech}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r ${techColors[tech] || 'from-gray-500 to-gray-600'} text-white`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Coverage</div>
                  <div className="text-sm font-medium text-cyan-400">{provider.coveragePercent}%</div>
                </div>
                <svg className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}

          {/* View all link */}
          <div className="pt-2 text-center">
            <Link
              href="/providers"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View all providers →
            </Link>
          </div>
        </div>
      )}
    </PanelWrapper>
  )
}
