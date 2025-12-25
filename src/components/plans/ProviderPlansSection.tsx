'use client'

import { motion } from 'framer-motion'
import { PlanCard } from './PlanCard'
import { getFeaturedPlansForProvider } from '@/lib/featuredPlans'

interface ProviderPlansSectionProps {
  providerSlug: string
  providerName: string
}

export function ProviderPlansSection({ providerSlug, providerName }: ProviderPlansSectionProps) {
  const providerPlans = getFeaturedPlansForProvider(providerSlug)

  if (!providerPlans || providerPlans.plans.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{providerName} Plans</h2>
          <p className="text-gray-400 mt-1">Compare featured internet plans from {providerName}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">Budget</span>
          <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">Best Value</span>
          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">Premium</span>
        </div>
      </div>

      {/* Provider Notes */}
      {providerPlans.notes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <ul className="text-sm text-gray-300 space-y-1">
              {providerPlans.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providerPlans.plans.map((plan, index) => (
          <PlanCard
            key={plan.planName}
            plan={plan}
            providerName={providerPlans.providerName}
            providerSlug={providerPlans.slug}
            index={index}
            showRecommendation={plan.tier === 'value'}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-6 text-center">
        * Prices and speeds shown are based on FCC Broadband Consumer Labels. Actual prices may vary by location.
        Check availability at your address for accurate pricing.
      </p>
    </div>
  )
}
