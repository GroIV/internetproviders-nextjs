'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PanelWrapper } from './PanelWrapper'
import { useCommandCenter } from '@/contexts/CommandCenterContext'
import { ProviderLogo } from '@/components/ProviderLogo'
import { getAffiliateUrl, hasAffiliateLink } from '@/lib/affiliates'

interface ProviderData {
  id: number
  name: string
  slug: string
  technologies: string[]
  description?: string
  maxSpeed?: number  // Now numeric from API
  startingPrice?: number  // Now numeric from API
}

interface Plan {
  planName: string
  price: number
  downloadSpeed: number
  uploadSpeed?: number
  technology: string
  tier: string
}

// Provider editorial content (description, pros, cons) - prices/speeds come from API
const providerEditorial: Record<string, { description: string; pros: string[]; cons: string[] }> = {
  'xfinity': { description: 'Leading cable and fiber provider with extensive nationwide coverage', pros: ['Wide availability', 'Bundle options', 'Fast speeds'], cons: ['Price increases after promo', 'Equipment fees'] },
  'spectrum': { description: 'Major cable provider known for no contracts and reliable service', pros: ['No contracts', 'Free modem', 'No data caps'], cons: ['Upload speeds limited', 'Price varies by region'] },
  'att-internet': { description: 'Nationwide fiber and DSL provider with extensive coverage', pros: ['Fiber available', 'No data caps on fiber', 'Reliable'], cons: ['DSL speeds limited', 'Equipment fees'] },
  'verizon-fios': { description: 'Premium fiber provider with symmetrical upload/download speeds', pros: ['Symmetrical speeds', 'No data caps', 'Reliable'], cons: ['Limited availability', 'Higher prices'] },
  'verizon-5g': { description: '5G home internet with no annual contracts', pros: ['No contracts', 'Easy setup', 'No data caps'], cons: ['Speed varies by location', 'Limited availability'] },
  'google-fiber': { description: 'Ultra-fast fiber in select cities with simple pricing', pros: ['Fastest speeds', 'Simple pricing', 'No data caps'], cons: ['Very limited availability', 'No bundles'] },
  'frontier': { description: 'Growing fiber network with competitive pricing', pros: ['Competitive pricing', 'No contracts', 'Growing fiber'], cons: ['Limited availability', 'Customer service'] },
  'frontier-fiber': { description: 'Growing fiber network with competitive pricing', pros: ['Competitive pricing', 'No contracts', 'Growing fiber'], cons: ['Limited availability', 'Customer service'] },
  'cox': { description: 'Regional cable and fiber provider with strong coverage', pros: ['Reliable speeds', 'Bundle options', 'Good coverage'], cons: ['Data caps', 'Price increases'] },
  't-mobile': { description: '5G home internet with no annual contracts', pros: ['No contracts', 'Easy setup', 'Affordable'], cons: ['Speed varies', 'Not available everywhere'] },
  'starlink': { description: 'Revolutionary satellite internet available virtually anywhere', pros: ['Available anywhere', 'No contracts', 'Low latency'], cons: ['High upfront cost', 'Weather dependent'] },
  'viasat': { description: 'Satellite internet for rural and remote areas', pros: ['Wide coverage', 'Rural availability'], cons: ['Data caps', 'Higher latency'] },
  'hughesnet': { description: 'Satellite internet with nationwide coverage', pros: ['Available everywhere', 'No contracts'], cons: ['Data caps', 'Higher latency'] },
  'centurylink': { description: 'Fiber and DSL provider with price-for-life guarantee', pros: ['Price lock guarantee', 'No contracts'], cons: ['Limited fiber areas', 'DSL speeds vary'] },
  'optimum': { description: 'Cable and fiber provider in the Northeast', pros: ['Fast fiber options', 'Competitive pricing'], cons: ['Regional only', 'Equipment fees'] },
  'metronet': { description: '100% fiber provider expanding across the Midwest', pros: ['100% fiber', 'Symmetrical speeds', 'No data caps'], cons: ['Limited availability', 'Expanding slowly'] },
  'ziply-fiber': { description: 'Northwest fiber provider with affordable plans', pros: ['Very affordable', 'True fiber', 'No contracts'], cons: ['Northwest only', 'Limited support'] },
  'brightspeed': { description: 'Fiber and DSL provider in the South and Midwest', pros: ['Growing fiber', 'Competitive pricing'], cons: ['New company', 'Limited fiber areas'] },
  'windstream': { description: 'Kinetic fiber and DSL service in rural areas', pros: ['Rural availability', 'Affordable'], cons: ['DSL speeds vary', 'Limited fiber'] },
  'wow': { description: 'Regional cable provider in the Midwest and Southeast', pros: ['No contracts', 'Competitive pricing'], cons: ['Limited availability', 'Regional only'] },
}

const techColors: Record<string, string> = {
  'Fiber': 'from-green-400 to-emerald-500',
  'Cable': 'from-blue-400 to-cyan-500',
  '5G': 'from-purple-400 to-pink-500',
  'DSL': 'from-yellow-400 to-amber-500',
  'Satellite': 'from-slate-400 to-gray-500',
  'Fixed Wireless': 'from-orange-400 to-red-500',
}

const tierColors: Record<string, string> = {
  'budget': 'text-green-400 border-green-500/30',
  'value': 'text-blue-400 border-blue-500/30',
  'premium': 'text-purple-400 border-purple-500/30',
}


export function ProviderDetailPanel({ data }: { data?: { providerSlug?: string; providerName?: string } }) {
  const { goBack, showPanel, context, updateContext } = useCommandCenter()
  const providerSlug = data?.providerSlug || context.lastProvider
  const [provider, setProvider] = useState<ProviderData | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAllPlans, setShowAllPlans] = useState(false)

  useEffect(() => {
    if (!providerSlug) return

    const fetchProviderData = async () => {
      setIsLoading(true)
      try {
        // Fetch real plan data from the provider API
        const res = await fetch(`/api/plans/${providerSlug}`)
        const apiData = await res.json()

        if (apiData.success && apiData.provider) {
          const editorial = providerEditorial[providerSlug] || {}

          // Get unique technologies from plans
          const technologies = apiData.provider.technologies ||
            [...new Set(apiData.plans?.residential?.map((p: { connectionType: string }) => p.connectionType) || [])]

          setProvider({
            id: apiData.provider.id,
            name: apiData.provider.name,
            slug: apiData.provider.slug,
            technologies: technologies,
            description: editorial.description,
            maxSpeed: apiData.summary?.speedRange?.max,
            startingPrice: apiData.summary?.priceRange?.min,
          })

          // Transform and sort plans by price
          const residentialPlans = (apiData.plans?.residential || []).map((p: {
            planName: string
            monthlyPrice: number
            downloadSpeed: number
            uploadSpeed?: number
            connectionType: string
          }) => ({
            planName: p.planName,
            price: p.monthlyPrice,
            downloadSpeed: p.downloadSpeed,
            uploadSpeed: p.uploadSpeed,
            technology: p.connectionType,
            tier: p.monthlyPrice < 60 ? 'budget' : p.monthlyPrice < 100 ? 'value' : 'premium',
          })).sort((a: Plan, b: Plan) => a.price - b.price)

          setPlans(residentialPlans)
        }
      } catch (error) {
        console.error('Failed to fetch provider:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProviderData()
  }, [providerSlug])

  const handleCompare = () => {
    // Add this provider to mentioned providers and show comparison prompt
    if (provider) {
      updateContext({
        mentionedProviders: [provider.name],
        comparisonRequested: true,
      })
      // Show recommendations so user can pick another provider to compare
      showPanel('recommendations', { zipCode: context.zipCode })
    }
  }

  const editorial = providerSlug ? providerEditorial[providerSlug] : null
  const displayedPlans = showAllPlans ? plans : plans.slice(0, 3)

  if (!providerSlug) {
    return (
      <PanelWrapper
        title="Provider Details"
        accentColor="blue"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        onClose={goBack}
      >
        <div className="text-center py-8 text-gray-400">
          <p>Ask about a specific provider to see details</p>
        </div>
      </PanelWrapper>
    )
  }

  return (
    <PanelWrapper
      title={provider?.name || data?.providerName || 'Provider Details'}
      accentColor="blue"
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      }
      onClose={goBack}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-700 rounded-xl" />
            <div className="flex-1">
              <div className="h-5 bg-gray-700 rounded w-32 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-48" />
            </div>
          </div>
          <div className="animate-pulse space-y-2">
            <div className="h-20 bg-gray-800 rounded-lg" />
            <div className="h-20 bg-gray-800 rounded-lg" />
          </div>
        </div>
      ) : provider ? (
        <div className="space-y-4">
          {/* Provider Header */}
          <div className="flex items-start gap-4">
            <ProviderLogo slug={provider.slug} name={provider.name} size="lg" />
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {provider.technologies.map((tech) => (
                  <span
                    key={tech}
                    className={`px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r ${techColors[tech] || 'from-gray-500 to-gray-600'} text-white`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {provider.description && (
                <p className="text-gray-400 text-sm">{provider.description}</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            {provider.maxSpeed && (
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-cyan-400">
                  {provider.maxSpeed >= 1000
                    ? `${(provider.maxSpeed / 1000).toFixed(provider.maxSpeed % 1000 === 0 ? 0 : 1)} Gbps`
                    : `${provider.maxSpeed} Mbps`}
                </div>
                <div className="text-xs text-gray-500">Max Speed</div>
              </div>
            )}
            {provider.startingPrice && (
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-[8px] text-gray-500 uppercase mb-0.5">As low as</div>
                <div className="text-lg font-bold text-green-400">${provider.startingPrice}/mo</div>
              </div>
            )}
          </div>

          {/* Pros & Cons */}
          {editorial && (editorial.pros?.length > 0 || editorial.cons?.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {editorial.pros?.length > 0 && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                  <div className="text-xs text-green-400 font-medium mb-2">Pros</div>
                  <ul className="space-y-1">
                    {editorial.pros.slice(0, 3).map((pro, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                        <svg className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {editorial.cons?.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <div className="text-xs text-red-400 font-medium mb-2">Cons</div>
                  <ul className="space-y-1">
                    {editorial.cons.slice(0, 3).map((con, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                        <svg className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Plans */}
          {plans.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Available Plans</div>
                {plans.length > 3 && (
                  <button
                    onClick={() => setShowAllPlans(!showAllPlans)}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    {showAllPlans ? 'Show less' : `Show all ${plans.length}`}
                  </button>
                )}
              </div>
              {displayedPlans.map((plan, index) => (
                <motion.div
                  key={plan.planName}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border ${tierColors[plan.tier] || 'border-gray-700/50'}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-white text-sm">{plan.planName}</div>
                      <span className={`text-[10px] uppercase ${tierColors[plan.tier]?.split(' ')[0] || 'text-gray-400'}`}>
                        {plan.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-cyan-400">{plan.downloadSpeed} Mbps down</span>
                      {plan.uploadSpeed && (
                        <span className="text-xs text-purple-400">{plan.uploadSpeed} Mbps up</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">${plan.price}</div>
                    <div className="text-xs text-gray-500">/month</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {/* Primary CTA - Order Button */}
            {hasAffiliateLink(provider.slug) && (
              <a
                href={getAffiliateUrl(provider.slug, 'chat') || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-base font-semibold rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Order {provider.name}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCompare}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare
              </button>
              <button
                onClick={() => showPanel('speedTest')}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Speed Test
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
        <div className="text-center py-8 text-gray-400">
          <p>Provider not found</p>
          <button
            onClick={goBack}
            className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
          >
            ← Go back
          </button>
        </div>
      )}
    </PanelWrapper>
  )
}
