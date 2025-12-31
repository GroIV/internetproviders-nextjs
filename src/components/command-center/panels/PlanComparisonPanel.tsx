'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PanelWrapper } from './PanelWrapper'
import { useCommandCenter } from '@/contexts/CommandCenterContext'
import { ProviderLogo } from '@/components/ProviderLogo'

interface Plan {
  providerName: string
  providerSlug: string
  planName: string
  price: number
  downloadSpeed: number
  uploadSpeed: number
  technology: string
  tier: 'budget' | 'value' | 'premium'
}

const tierColors = {
  budget: 'from-green-400 to-emerald-500',
  value: 'from-blue-400 to-cyan-500',
  premium: 'from-purple-400 to-pink-500',
}

const techColors: Record<string, string> = {
  'Fiber': 'from-green-400 to-emerald-500',
  'Cable': 'from-blue-400 to-cyan-500',
  '5G': 'from-purple-400 to-pink-500',
  'DSL': 'from-yellow-400 to-amber-500',
  'Satellite': 'from-slate-400 to-gray-500',
}

export function PlanComparisonPanel({ data }: { data?: { providers?: string[] } }) {
  const { context, goBack, showPanel } = useCommandCenter()
  const providers = data?.providers || context.mentionedProviders.slice(0, 2)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Stable provider key to prevent re-fetching
  const providerKey = providers.slice(0, 2).sort().join(',')

  useEffect(() => {
    if (!context.zipCode || providers.length < 2) return

    const fetchPlans = async () => {
      setIsLoading(true)
      try {
        // Fetch plans for comparison
        const res = await fetch(`/api/plans/featured?zip=${context.zipCode}`)
        const apiData = await res.json()

        if (apiData.providers) {
          // Extract plans from providers array
          const allPlans: Plan[] = []
          const providerSlugs = providers.map(p =>
            p.toLowerCase().replace(/\s+/g, '-').replace('&', '')
          )

          for (const provider of apiData.providers) {
            // Check if this provider matches one we're comparing
            const providerSlug = provider.slug?.toLowerCase() || ''
            const providerName = provider.name?.toLowerCase() || ''

            const isMatch = providerSlugs.some(slug =>
              providerSlug.includes(slug) ||
              providerName.includes(slug.replace('-', ' ')) ||
              slug.includes(providerSlug.split('-')[0]) ||
              providerName.includes(slug.split('-')[0])
            )

            if (isMatch && provider.plans) {
              // Get the "value" tier plan, or first plan if not available
              const valuePlan = provider.plans.find((p: { tier: string }) => p.tier === 'value') || provider.plans[0]
              if (valuePlan) {
                allPlans.push({
                  providerName: provider.name,
                  providerSlug: provider.slug,
                  planName: valuePlan.planName,
                  price: valuePlan.price,
                  downloadSpeed: valuePlan.downloadSpeed,
                  uploadSpeed: valuePlan.uploadSpeed || 0,
                  technology: valuePlan.technology,
                  tier: valuePlan.tier,
                })
              }
            }
          }
          setPlans(allPlans.slice(0, 2))
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [context.zipCode, providerKey, providers])

  // Determine winner for each category
  const getWinner = (category: 'price' | 'speed') => {
    if (plans.length < 2) return null
    if (category === 'price') {
      return plans[0].price < plans[1].price ? 0 : plans[0].price > plans[1].price ? 1 : null
    }
    return plans[0].downloadSpeed > plans[1].downloadSpeed ? 0 : plans[0].downloadSpeed < plans[1].downloadSpeed ? 1 : null
  }

  const priceWinner = getWinner('price')
  const speedWinner = getWinner('speed')

  if (providers.length < 2) {
    return (
      <PanelWrapper
        title="Compare Providers"
        accentColor="purple"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
        onClose={goBack}
      >
        <div className="text-center py-6 text-gray-400">
          <p>Mention two providers to compare them</p>
          <p className="text-sm mt-2">Try: &quot;Compare AT&T vs Spectrum&quot;</p>
          <button
            onClick={() => showPanel('recommendations', { zipCode: context.zipCode })}
            className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
          >
            ← Browse providers
          </button>
        </div>
      </PanelWrapper>
    )
  }

  return (
    <PanelWrapper
      title={`${providers[0]} vs ${providers[1]}`}
      accentColor="purple"
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
      onClose={goBack}
    >
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 bg-gray-800/50 rounded-xl">
              <div className="w-12 h-12 bg-gray-700 rounded-lg mb-3 mx-auto" />
              <div className="h-4 bg-gray-700 rounded w-20 mx-auto mb-2" />
              <div className="h-8 bg-gray-700 rounded w-16 mx-auto" />
            </div>
          ))}
        </div>
      ) : plans.length > 0 ? (
        <div className="space-y-4">
          {/* Provider cards - clickable */}
          <div className="grid grid-cols-2 gap-3">
            {plans.slice(0, 2).map((plan, index) => (
              <motion.button
                key={plan.providerSlug + plan.planName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => showPanel('providerDetail', { providerSlug: plan.providerSlug, providerName: plan.providerName })}
                className="relative p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-purple-500/30 hover:bg-gray-800 transition-all text-left"
              >
                {/* Tier badge */}
                <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r ${tierColors[plan.tier]} text-white`}>
                  {plan.tier}
                </div>

                <div className="text-center">
                  <ProviderLogo slug={plan.providerSlug} name={plan.providerName} size="md" className="mx-auto mb-2" />
                  <div className="text-xs text-gray-400 truncate">{plan.planName}</div>

                  <div className="mt-3">
                    <div className={`text-2xl font-bold ${priceWinner === index ? 'text-green-400' : 'text-white'}`}>
                      ${plan.price}
                      {priceWinner === index && <span className="text-xs ml-1">★</span>}
                    </div>
                    <div className="text-xs text-gray-500">/month</div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <div className={`text-lg font-semibold ${speedWinner === index ? 'text-cyan-400' : 'text-white'}`}>
                      {plan.downloadSpeed} Mbps
                      {speedWinner === index && <span className="text-xs ml-1">★</span>}
                    </div>
                    <div className="text-xs text-gray-500">download</div>
                  </div>

                  <div className="mt-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r ${techColors[plan.technology] || 'from-gray-400 to-gray-500'} text-white`}>
                      {plan.technology}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Comparison summary */}
          <div className="bg-gray-800/30 rounded-lg p-3 text-sm">
            <div className="text-xs text-gray-500 uppercase mb-2">Quick Summary</div>
            <ul className="space-y-1 text-gray-300">
              {priceWinner !== null && (
                <li className="flex items-center gap-2">
                  <span className="text-green-400">💰</span>
                  <span><strong>{plans[priceWinner].providerName}</strong> is cheaper by ${Math.abs(plans[0].price - plans[1].price)}/mo</span>
                </li>
              )}
              {speedWinner !== null && (
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">⚡</span>
                  <span><strong>{plans[speedWinner].providerName}</strong> is {Math.round((plans[speedWinner].downloadSpeed / plans[speedWinner === 0 ? 1 : 0].downloadSpeed - 1) * 100)}% faster</span>
                </li>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <button
                onClick={() => showPanel('speedTest')}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Test Your Speed
              </button>
            </div>
            <button
              onClick={() => showPanel('recommendations', { zipCode: context.zipCode })}
              className="w-full py-2 px-4 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Providers
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400">
          <p>No plans available for comparison</p>
          <button
            onClick={() => showPanel('recommendations', { zipCode: context.zipCode })}
            className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
          >
            ← Browse providers
          </button>
        </div>
      )}
    </PanelWrapper>
  )
}
