'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlanCard } from './PlanCard'
import { featuredPlans, getBestValuePlans, type ProviderFeaturedPlans, type FeaturedPlan } from '@/lib/featuredPlans'

type ViewMode = 'providers' | 'tiers' | 'value'
type TierFilter = 'all' | 'budget' | 'value' | 'premium'

interface FeaturedPlansDisplayProps {
  initialProvider?: string
  showFilters?: boolean
}

export function FeaturedPlansDisplay({
  initialProvider,
  showFilters = true
}: FeaturedPlansDisplayProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('providers')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [selectedProvider, setSelectedProvider] = useState<string | null>(initialProvider || null)

  // Get all plans with provider info
  const allPlansWithProvider = featuredPlans.flatMap(provider =>
    provider.plans.map(plan => ({
      ...plan,
      providerName: provider.providerName,
      providerSlug: provider.slug
    }))
  )

  // Filter plans based on tier
  const filteredPlans = tierFilter === 'all'
    ? allPlansWithProvider
    : allPlansWithProvider.filter(p => p.tier === tierFilter)

  // Get best value plans
  const valuePlans = getBestValuePlans()

  return (
    <div className="space-y-8">
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
            {featuredPlans
              .filter(p => !selectedProvider || p.slug === selectedProvider)
              .map((provider, providerIndex) => (
                <ProviderSection
                  key={provider.slug}
                  provider={provider}
                  index={providerIndex}
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
              </p>
            </div>

            {/* Podium for top 3 */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Provider section component
function ProviderSection({
  provider,
  index
}: {
  provider: ProviderFeaturedPlans
  index: number
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
