'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TVPlanCard } from './TVPlanCard'

interface TVPlan {
  id: number
  plan_id: string
  provider_name: string
  package_name: string
  base_price: number
  gemini_fee: number
  rsn_fee_max: number
  total_min: number
  total_max: number
  channel_count: number | null
  channel_count_text: string
  contract_months: number
  activation_fee: number
  early_termination_fee: string
  premium_channels: string[]
  features: string[]
  notes: string | null
  service_type: string
}

interface TVPlansSectionProps {
  providerName: string
  providerSlug: string
}

export function TVPlansSection({ providerName, providerSlug }: TVPlansSectionProps) {
  const [plans, setPlans] = useState<TVPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch(`/api/tv-plans/${encodeURIComponent(providerName)}`)
        if (response.ok) {
          const data = await response.json()
          setPlans(data)
        }
      } catch (error) {
        console.error('Error fetching TV plans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [providerName])

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (plans.length === 0) {
    return null
  }

  // Find the "CHOICE" package as most popular (or middle option)
  const popularIndex = plans.findIndex(p => p.package_name === 'CHOICE') !== -1
    ? plans.findIndex(p => p.package_name === 'CHOICE')
    : Math.floor(plans.length / 2)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{providerName} TV Packages</h2>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
              Satellite TV
            </span>
          </div>
          <p className="text-gray-400 mt-1">Compare TV packages from {providerName}</p>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-amber-400 mb-1">Regional Sports Network (RSN) Fee</p>
            <p>Packages with sports channels may include an RSN fee up to $19.99/mo depending on your location. The fee varies by market.</p>
          </div>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <TVPlanCard
            key={plan.plan_id}
            plan={plan}
            providerSlug={providerSlug}
            index={index}
            isPopular={index === popularIndex}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-6 text-center">
        * Prices shown include Gemini (equipment) fee. Additional fees, taxes, and equipment charges may apply.
        24-month commitment required. Early termination fee of $20/mo remaining applies.
      </p>
    </div>
  )
}
