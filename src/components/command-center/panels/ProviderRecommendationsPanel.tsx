'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PanelWrapper } from './PanelWrapper'
import { useCommandCenter } from '@/contexts/CommandCenterContext'
import { ProviderLogo } from '@/components/ProviderLogo'
import { getAffiliateUrl, hasAffiliateLink } from '@/lib/affiliates'

interface Provider {
  id: number
  name: string
  slug: string
  technologies: string[]
  coveragePercent: number
  startingPrice: number | null
  maxSpeed: number | null
  planCount: number
  isEstimate?: boolean
}

// Format speed for display
function formatSpeed(speedMbps: number): string {
  if (speedMbps >= 1000) {
    return `${(speedMbps / 1000).toFixed(speedMbps % 1000 === 0 ? 0 : 1)} Gbps`
  }
  return `${speedMbps} Mbps`
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
  const { context, goBack, showPanel } = useCommandCenter()
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
      onClose={goBack}
    >
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl">
              <div className="flex justify-center mb-3">
                <div className="w-32 h-16 bg-gray-700 rounded-lg" />
              </div>
              <div className="text-center">
                <div className="h-4 bg-gray-700 rounded w-24 mx-auto mb-3" />
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="h-10 bg-gray-700 rounded w-16" />
                  <div className="w-px h-10 bg-gray-700" />
                  <div className="h-10 bg-gray-700 rounded w-20" />
                </div>
                <div className="h-12 bg-gray-700 rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-gray-400">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {providers.map((provider, index) => {
            const affiliateUrl = hasAffiliateLink(provider.slug) ? getAffiliateUrl(provider.slug, 'chat') : null
            const hasRealData = provider.startingPrice !== null && provider.maxSpeed !== null

            return (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group relative p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700/50 hover:border-cyan-500/40 transition-all cursor-pointer"
                onClick={() => showPanel('providerDetail', { providerSlug: provider.slug, providerName: provider.name })}
              >
                {/* Tech badge - top right */}
                <div className="absolute top-3 right-3">
                  {provider.technologies.slice(0, 1).map((tech) => (
                    <span
                      key={tech}
                      className={`px-2 py-1 rounded-full text-[9px] font-medium bg-gradient-to-r ${techColors[tech] || 'from-gray-500 to-gray-600'} text-white`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Large centered logo */}
                <div className="flex justify-center mb-3">
                  <ProviderLogo slug={provider.slug} name={provider.name} size="lg" />
                </div>

                {/* Provider name and coverage */}
                <div className="text-center">
                  <div className="text-base font-semibold text-white">{provider.name}</div>
                  {provider.coveragePercent < 100 && (
                    <div className="text-[10px] text-gray-500 mb-2">
                      {Math.round(provider.coveragePercent)}% area coverage
                    </div>
                  )}
                  {provider.coveragePercent >= 100 && <div className="mb-3" />}

                  {/* Price and Speed side by side */}
                  {hasRealData ? (
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div>
                        <div className="text-2xl text-green-400 font-bold">
                          {provider.isEstimate && <span className="text-base">~</span>}${provider.startingPrice}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase">
                          {provider.isEstimate ? 'from' : 'per month'}
                        </div>
                      </div>
                      <div className="w-px h-10 bg-gray-700" />
                      <div>
                        <div className="text-2xl text-cyan-400 font-bold">
                          {provider.isEstimate && <span className="text-base">~</span>}{formatSpeed(provider.maxSpeed!)}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase">
                          {provider.isEstimate ? 'up to' : 'max speed'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="text-lg text-gray-400">{provider.coveragePercent}% coverage</div>
                    </div>
                  )}

                  {/* CTA Button */}
                  {affiliateUrl ? (
                    <a
                      href={affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="block w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all text-center"
                    >
                      Order Now
                    </a>
                  ) : (
                    <button className="w-full py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all">
                      View Details
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* Quick actions */}
          <div className="col-span-2 pt-2 flex gap-3">
            <button
              onClick={() => showPanel('coverage', { zipCode })}
              className="flex-1 py-2.5 px-3 bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium rounded-xl hover:bg-gray-700 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Coverage Stats
            </button>
            <button
              onClick={() => showPanel('speedTest')}
              className="flex-1 py-2.5 px-3 bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium rounded-xl hover:bg-gray-700 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Speed Test
            </button>
          </div>

          {/* Disclaimer */}
          <div className="col-span-2 pt-2">
            <p className="text-[10px] text-gray-500 text-center">
              Coverage based on FCC data for your metro area. Availability may vary by specific address.
            </p>
          </div>
        </div>
      )}
    </PanelWrapper>
  )
}
