'use client'

import { motion } from 'framer-motion'
import { MiniPlanCard } from './MiniPlanCard'
import type { FeaturedPlan } from '@/lib/featuredPlans'
import Link from 'next/link'

export interface SuggestedPlan extends FeaturedPlan {
  providerName: string
  providerSlug: string
}

interface SuggestedPlansRowProps {
  plans: SuggestedPlan[]
  title?: string
  onAskAI?: (planName: string, providerName: string) => void
}

export function SuggestedPlansRow({
  plans,
  title = "Recommended Plans",
  onAskAI
}: SuggestedPlansRowProps) {
  if (!plans || plans.length === 0) return null

  return (
    <motion.div
      className="mt-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
          <span className="text-sm font-medium text-gray-300">{title}</span>
          <span className="text-xs text-gray-500">({plans.length} plans)</span>
        </div>
        <Link
          href="/plans"
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
        >
          View all
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Scrollable cards row */}
      <div className="relative">
        {/* Gradient fade on right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />

        {/* Cards container */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {plans.map((plan, index) => (
            <MiniPlanCard
              key={`${plan.providerSlug}-${plan.planName}`}
              plan={plan}
              index={index}
              onAskAI={onAskAI}
            />
          ))}
        </div>
      </div>

      {/* Scroll hint for mobile */}
      <div className="flex justify-center mt-2 md:hidden">
        <span className="text-[10px] text-gray-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Swipe to see more
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </motion.div>
  )
}
