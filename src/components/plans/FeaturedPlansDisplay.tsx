'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlanCard } from './PlanCard'
import { featuredPlans, type ProviderFeaturedPlans } from '@/lib/featuredPlans'
import { useLocation } from '@/contexts/LocationContext'
import { sortByTechPriority } from '@/lib/techPriority'

type ViewMode = 'providers' | 'tiers' | 'value'
type TierFilter = 'all' | 'budget' | 'value' | 'premium'

interface AvailableProvider {
  id: number
  name: string
  slug: string
  technologies: string[]
  category: string
  coveragePercent: number
}

interface FeaturedPlansDisplayProps {
  initialProvider?: string
  showFilters?: boolean
}

export function FeaturedPlansDisplay({
  initialProvider,
  showFilters = true
}: FeaturedPlansDisplayProps) {
  const { location, setManualZip } = useLocation()
  const [viewMode, setViewMode] = useState<ViewMode>('providers')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [selectedProvider] = useState<string | null>(initialProvider || null)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
  const [availableProviders, setAvailableProviders] = useState<AvailableProvider[]>([])
  const [isLoadingProviders, setIsLoadingProviders] = useState(false)
  const [zipInput, setZipInput] = useState('')

  // Fetch available providers when location changes
  useEffect(() => {
    if (location?.zipCode && showOnlyAvailable) {
      fetchAvailableProviders(location.zipCode)
    }
  }, [location?.zipCode, showOnlyAvailable])

  const fetchAvailableProviders = async (zipCode: string) => {
    setIsLoadingProviders(true)
    try {
      const response = await fetch(`/api/providers/available?zip=${zipCode}`)
      const data = await response.json()
      if (data.success) {
        setAvailableProviders(data.data.providers)
      }
    } catch (error) {
      console.error('Failed to fetch available providers:', error)
    } finally {
      setIsLoadingProviders(false)
    }
  }

  // Get available provider slugs for filtering
  const availableSlugs = useMemo(() =>
    new Set(availableProviders.map(p => p.slug)),
    [availableProviders]
  )

  // Filter featured plans based on availability and sort by technology priority
  const filteredFeaturedPlans = useMemo(() => {
    let plans: ProviderFeaturedPlans[]
    if (!showOnlyAvailable || !location?.zipCode || availableProviders.length === 0) {
      plans = featuredPlans
    } else {
      plans = featuredPlans.filter(p => availableSlugs.has(p.slug))
    }
    // Sort by best technology (Fiber > Cable > 5G > Fixed Wireless > DSL > Satellite)
    return sortByTechPriority(plans, (provider) =>
      provider.plans.map(plan => plan.technology)
    )
  }, [showOnlyAvailable, location?.zipCode, availableProviders, availableSlugs])

  // Get all plans with provider info (filtered and sorted by technology)
  const allPlansWithProvider = useMemo(() => {
    const plans = filteredFeaturedPlans.flatMap(provider =>
      provider.plans.map(plan => ({
        ...plan,
        providerName: provider.providerName,
        providerSlug: provider.slug
      }))
    )
    // Sort by technology priority (Fiber > Cable > 5G > Fixed Wireless > DSL > Satellite)
    return sortByTechPriority(plans, (plan) => plan.technology)
  }, [filteredFeaturedPlans])

  // Filter plans based on tier
  const filteredPlans = tierFilter === 'all'
    ? allPlansWithProvider
    : allPlansWithProvider.filter(p => p.tier === tierFilter)

  // Get best value plans (filtered)
  const valuePlans = useMemo(() => {
    const plans = allPlansWithProvider
      .filter(plan => plan.tier === 'value')
      .sort((a, b) => {
        const scoreA = a.downloadSpeed / a.price
        const scoreB = b.downloadSpeed / b.price
        return scoreB - scoreA
      })
    return plans
  }, [allPlansWithProvider])

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (/^\d{5}$/.test(zipInput)) {
      setManualZip(zipInput)
    }
  }

  return (
    <div className="space-y-8">
      {/* Location & Filter Controls */}
      {showFilters && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* ZIP Code Input */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">Your location:</span>
              </div>

              {location?.zipCode ? (
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">
                    {location.city ? `${location.city}, ` : ''}{location.zipCode}
                  </span>
                  <button
                    onClick={() => setZipInput('')}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <form onSubmit={handleZipSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter ZIP"
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="w-24 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!/^\d{5}$/.test(zipInput)}
                    className="px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Go
                  </button>
                </form>
              )}
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className={`text-sm ${!showOnlyAvailable ? 'text-white' : 'text-gray-500'}`}>
                All Plans
              </span>
              <button
                onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                disabled={!location?.zipCode}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                  showOnlyAvailable && location?.zipCode
                    ? 'bg-cyan-600'
                    : 'bg-gray-700'
                } ${!location?.zipCode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    showOnlyAvailable && location?.zipCode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-sm ${showOnlyAvailable && location?.zipCode ? 'text-white' : 'text-gray-500'}`}>
                Available in My Area
              </span>
            </div>
          </div>

          {/* Status Message */}
          {showOnlyAvailable && location?.zipCode && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              {isLoadingProviders ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  Loading available plans...
                </div>
              ) : filteredFeaturedPlans.length > 0 ? (
                <p className="text-sm text-gray-400">
                  Showing plans from <span className="text-cyan-400 font-medium">{filteredFeaturedPlans.length}</span> providers available in{' '}
                  <span className="text-white">{location.city || location.zipCode}</span>
                </p>
              ) : availableProviders.length === 0 ? (
                <p className="text-sm text-yellow-400">
                  No provider coverage data found for this ZIP. Showing all plans.
                </p>
              ) : (
                <p className="text-sm text-yellow-400">
                  No featured plans match available providers. Showing all plans.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter/View controls */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 justify-between items-center">
          {/* View mode tabs */}
          <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
            {[
              { mode: 'providers' as ViewMode, label: 'By Provider' },
              { mode: 'tiers' as ViewMode, label: 'By Tier' },
              { mode: 'value' as ViewMode, label: 'Best Value' }
            ].map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tier filter (only shown in tiers view) */}
          {viewMode === 'tiers' && (
            <div className="flex gap-2">
              {[
                { tier: 'all' as TierFilter, label: 'All', color: 'gray' },
                { tier: 'budget' as TierFilter, label: 'Budget', color: 'green' },
                { tier: 'value' as TierFilter, label: 'Best Value', color: 'cyan' },
                { tier: 'premium' as TierFilter, label: 'Premium', color: 'purple' }
              ].map(({ tier, label, color }) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    tierFilter === tier
                      ? color === 'green' ? 'bg-green-500/20 text-green-400 border-green-500/50'
                      : color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                      : color === 'purple' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                      : 'bg-gray-700 text-white border-gray-600'
                      : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content based on view mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'providers' && (
          <motion.div
            key="providers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {filteredFeaturedPlans
              .filter(p => !selectedProvider || p.slug === selectedProvider)
              .map((provider, providerIndex) => (
                <ProviderSection
                  key={provider.slug}
                  provider={provider}
                  index={providerIndex}
                  coveragePercent={availableProviders.find(ap => ap.slug === provider.slug)?.coveragePercent}
                />
              ))}
          </motion.div>
        )}

        {viewMode === 'tiers' && (
          <motion.div
            key="tiers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPlans.map((plan, index) => (
              <PlanCard
                key={`${plan.providerSlug}-${plan.planName}`}
                plan={plan}
                providerName={plan.providerName}
                providerSlug={plan.providerSlug}
                index={index}
              />
            ))}
          </motion.div>
        )}

        {viewMode === 'value' && (
          <motion.div
            key="value"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Value ranking header */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Best Value Rankings
              </h3>
              <p className="text-gray-400">
                Plans ranked by Mbps per dollar spent
                {showOnlyAvailable && location?.zipCode && ' (available in your area)'}
              </p>
            </div>

            {/* Podium for top 3 */}
            {valuePlans.length >= 3 && (
              <div className="flex justify-center items-end gap-4 py-8">
                {/* Second place */}
                {valuePlans[1] && (
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-6xl mb-2">🥈</div>
                    <div className="bg-gradient-to-t from-gray-700 to-gray-600 rounded-t-xl w-32 h-24 flex items-end justify-center pb-3">
                      <span className="text-3xl font-bold text-gray-300">2</span>
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-white font-medium">{valuePlans[1].providerName}</p>
                      <p className="text-gray-400 text-sm">{valuePlans[1].planName}</p>
                      <p className="text-cyan-400 text-sm font-bold">
                        {(valuePlans[1].downloadSpeed / valuePlans[1].price).toFixed(1)} Mbps/$
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* First place */}
                {valuePlans[0] && (
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="text-7xl mb-2">🥇</div>
                    <div className="bg-gradient-to-t from-yellow-600/80 to-yellow-500/80 rounded-t-xl w-36 h-32 flex items-end justify-center pb-3 border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20">
                      <span className="text-4xl font-bold text-yellow-100">1</span>
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-white font-bold text-lg">{valuePlans[0].providerName}</p>
                      <p className="text-gray-300">{valuePlans[0].planName}</p>
                      <p className="text-green-400 font-bold">
                        {(valuePlans[0].downloadSpeed / valuePlans[0].price).toFixed(1)} Mbps/$
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Third place */}
                {valuePlans[2] && (
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-5xl mb-2">🥉</div>
                    <div className="bg-gradient-to-t from-orange-800/80 to-orange-700/80 rounded-t-xl w-28 h-20 flex items-end justify-center pb-3">
                      <span className="text-2xl font-bold text-orange-200">3</span>
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-white font-medium">{valuePlans[2].providerName}</p>
                      <p className="text-gray-400 text-sm">{valuePlans[2].planName}</p>
                      <p className="text-cyan-400 text-sm font-bold">
                        {(valuePlans[2].downloadSpeed / valuePlans[2].price).toFixed(1)} Mbps/$
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Full value ranking list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {valuePlans.map((plan, index) => (
                <PlanCard
                  key={`${plan.providerSlug}-${plan.planName}`}
                  plan={plan}
                  providerName={plan.providerName}
                  providerSlug={plan.providerSlug}
                  index={index}
                  showRecommendation={index === 0}
                />
              ))}
            </div>

            {valuePlans.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No value plans available for your location.</p>
                <button
                  onClick={() => setShowOnlyAvailable(false)}
                  className="mt-4 text-cyan-400 hover:text-cyan-300"
                >
                  View all plans
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {filteredFeaturedPlans.length === 0 && viewMode !== 'value' && (
        <div className="text-center py-12 text-gray-400">
          <p>No featured plans available for your location.</p>
          <button
            onClick={() => setShowOnlyAvailable(false)}
            className="mt-4 text-cyan-400 hover:text-cyan-300"
          >
            View all plans
          </button>
        </div>
      )}
    </div>
  )
}

// Provider section component
function ProviderSection({
  provider,
  index,
  coveragePercent
}: {
  provider: ProviderFeaturedPlans
  index: number
  coveragePercent?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="space-y-6"
    >
      {/* Provider header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl font-bold text-white border border-gray-600">
            {provider.providerName.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{provider.providerName}</h2>
            <p className="text-gray-400 text-sm">{provider.plans.length} Featured Plans</p>
          </div>
        </div>
        {coveragePercent !== undefined && (
          <span className="px-3 py-1.5 bg-cyan-600/20 text-cyan-400 text-sm rounded-full">
            {coveragePercent}% coverage
          </span>
        )}
      </div>

      {/* Provider notes */}
      {provider.notes.length > 0 && (
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
          <ul className="grid md:grid-cols-2 gap-2">
            {provider.notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {provider.plans.map((plan, planIndex) => (
          <PlanCard
            key={plan.planName}
            plan={plan}
            providerName={provider.providerName}
            providerSlug={provider.slug}
            index={planIndex}
            showRecommendation={plan.tier === 'value'}
          />
        ))}
      </div>
    </motion.div>
  )
}
