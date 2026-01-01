'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PanelWrapper } from './PanelWrapper'
import { useCommandCenter } from '@/contexts/CommandCenterContext'
import { ProviderLogo } from '@/components/ProviderLogo'
import { getAffiliateUrl, hasAffiliateLink } from '@/lib/affiliates'
import { NetworkMeshBackground } from '../NetworkMeshBackground'

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

const techColors: Record<string, { bg: string; border: string; text: string }> = {
  'Fiber': { bg: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  'Cable': { bg: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/40', text: 'text-blue-400' },
  '5G': { bg: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-500/40', text: 'text-purple-400' },
  'DSL': { bg: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/40', text: 'text-amber-400' },
  'Satellite': { bg: 'from-slate-500/20 to-gray-500/10', border: 'border-slate-500/40', text: 'text-slate-400' },
  'Fixed Wireless': { bg: 'from-orange-500/20 to-red-500/10', border: 'border-orange-500/40', text: 'text-orange-400' },
}

const rankColors = [
  { bg: 'from-amber-500 to-yellow-500', text: 'text-amber-900', label: '#1' },
  { bg: 'from-slate-400 to-gray-400', text: 'text-slate-900', label: '#2' },
  { bg: 'from-orange-600 to-amber-600', text: 'text-orange-900', label: '#3' },
]

// Speed bar component
function SpeedBar({ speed, maxSpeed, color }: { speed: number; maxSpeed: number; color: string }) {
  const percentage = Math.min((speed / maxSpeed) * 100, 100)

  return (
    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      />
    </div>
  )
}

// Enhanced provider card
function ProviderCard({
  provider,
  index,
  maxSpeedInList,
  onSelect,
  affiliateUrl
}: {
  provider: Provider
  index: number
  maxSpeedInList: number
  onSelect: () => void
  affiliateUrl: string | null
}) {
  const hasRealData = provider.startingPrice !== null && provider.maxSpeed !== null
  const tech = provider.technologies[0] || 'Cable'
  const techStyle = techColors[tech] || techColors['Cable']
  const rankStyle = rankColors[index] || null
  const isTopThree = index < 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300
        bg-gradient-to-br ${techStyle.bg} ${techStyle.border} border
        hover:shadow-lg hover:shadow-cyan-500/10`}
      onClick={onSelect}
    >
      {/* Animated glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Rank badge */}
      {isTopThree && rankStyle && (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.2 }}
          className={`absolute top-0 left-0 px-3 py-1 rounded-br-xl bg-gradient-to-r ${rankStyle.bg} ${rankStyle.text} text-xs font-bold shadow-lg`}
        >
          {rankStyle.label}
        </motion.div>
      )}

      {/* Tech badge - top right */}
      <div className="absolute top-2 right-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${techStyle.text} bg-gray-900/60 backdrop-blur-sm border ${techStyle.border}`}>
          {tech}
        </span>
      </div>

      <div className="p-4 pt-8">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <div className="relative">
            <ProviderLogo slug={provider.slug} name={provider.name} size="lg" />
            {/* Glow behind logo */}
            <div className={`absolute inset-0 blur-xl opacity-30 ${techStyle.text.replace('text-', 'bg-')}`} />
          </div>
        </div>

        {/* Provider name */}
        <div className="text-center mb-3">
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
            {provider.name}
          </h3>
          {provider.coveragePercent < 100 && (
            <p className="text-[10px] text-gray-500">
              {Math.round(provider.coveragePercent)}% area coverage
            </p>
          )}
        </div>

        {/* Speed bar visualization */}
        {hasRealData && provider.maxSpeed && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-wide">Max Speed</span>
              <span className="text-sm font-bold text-cyan-400">{formatSpeed(provider.maxSpeed)}</span>
            </div>
            <SpeedBar
              speed={provider.maxSpeed}
              maxSpeed={maxSpeedInList}
              color="bg-gradient-to-r from-cyan-500 to-blue-500"
            />
          </div>
        )}

        {/* Price and stats */}
        {hasRealData ? (
          <div className="flex items-center justify-between mb-4 px-2 py-2 bg-gray-900/40 rounded-lg">
            <div className="text-center">
              <div className="text-[8px] text-gray-500 uppercase mb-0.5">As low as</div>
              <div className="text-lg font-bold text-green-400">
                {provider.isEstimate && <span className="text-xs">~</span>}${provider.startingPrice}<span className="text-xs text-gray-500">/mo</span>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center">
              <div className="text-lg font-bold text-white">{provider.planCount || '—'}</div>
              <div className="text-[9px] text-gray-500 uppercase">Plans</div>
            </div>
          </div>
        ) : (
          <div className="mb-4 text-center py-2">
            <span className="text-gray-400 text-sm">{provider.coveragePercent}% coverage</span>
          </div>
        )}

        {/* CTA Button */}
        {affiliateUrl ? (
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="block w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:from-green-400 hover:to-emerald-400 transition-all text-center"
          >
            Order Now
          </a>
        ) : (
          <button className="w-full py-2.5 bg-gray-800/80 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-all border border-gray-700 hover:border-gray-600">
            View Details
          </button>
        )}
      </div>
    </motion.div>
  )
}

export function ProviderRecommendationsPanel({ data }: { data?: { zipCode?: string } }) {
  const { context, goBack, showPanel } = useCommandCenter()
  const zipCode = data?.zipCode || context.zipCode
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const maxSpeedInList = useMemo(() => {
    return Math.max(...providers.map(p => p.maxSpeed || 0), 1000)
  }, [providers])

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
      <div className="relative">
        {/* Animated background */}
        <div className="absolute inset-0 -m-4 overflow-hidden rounded-xl">
          <NetworkMeshBackground nodeCount={15} connectionDistance={100} />
        </div>

        <div className="relative z-10">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-700/30">
                  <div className="flex justify-center mb-3">
                    <div className="w-24 h-12 bg-gray-700/50 rounded-lg" />
                  </div>
                  <div className="text-center space-y-2">
                    <div className="h-4 bg-gray-700/50 rounded w-20 mx-auto" />
                    <div className="h-1.5 bg-gray-700/50 rounded-full w-full" />
                    <div className="h-10 bg-gray-700/50 rounded-lg w-full" />
                    <div className="h-10 bg-gray-700/50 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400">{error}</p>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-2 mb-4"
              >
                <div className="text-center p-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/30">
                  <div className="text-xl font-bold text-white">{providers.length}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Providers</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/30">
                  <div className="text-xl font-bold text-cyan-400">{formatSpeed(maxSpeedInList)}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Top Speed</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/30">
                  <div className="text-xl font-bold text-green-400">
                    ${Math.min(...providers.filter(p => p.startingPrice).map(p => p.startingPrice!)) || '—'}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">From</div>
                </div>
              </motion.div>

              {/* Provider cards */}
              <div className="grid grid-cols-2 gap-3">
                {providers.map((provider, index) => {
                  const affiliateUrl = hasAffiliateLink(provider.slug) ? getAffiliateUrl(provider.slug, 'chat') : null
                  return (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      index={index}
                      maxSpeedInList={maxSpeedInList}
                      affiliateUrl={affiliateUrl}
                      onSelect={() => showPanel('providerDetail', { providerSlug: provider.slug, providerName: provider.name })}
                    />
                  )
                })}
              </div>

              {/* Quick actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 flex gap-3"
              >
                <button
                  onClick={() => showPanel('coverage', { zipCode })}
                  className="flex-1 py-2.5 px-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-300 text-xs font-medium rounded-xl hover:bg-gray-700/80 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Coverage
                </button>
                <button
                  onClick={() => showPanel('speedTest')}
                  className="flex-1 py-2.5 px-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-300 text-xs font-medium rounded-xl hover:bg-gray-700/80 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Speed Test
                </button>
              </motion.div>

              {/* Check Exact Address CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3"
              >
                <button
                  onClick={() => showPanel('addressAvailability')}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 text-purple-300 text-xs font-medium rounded-xl hover:from-purple-600/30 hover:to-pink-600/30 hover:border-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Check Your Exact Address
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </PanelWrapper>
  )
}
