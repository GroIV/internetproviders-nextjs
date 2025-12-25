'use client'

import { motion } from 'framer-motion'
import { getAffiliateUrl } from '@/lib/affiliates'
import type { FeaturedPlan } from '@/lib/featuredPlans'

interface MiniPlanCardProps {
  plan: FeaturedPlan & { providerName: string; providerSlug: string }
  index?: number
  onAskAI?: (planName: string, providerName: string) => void
}

// Tier configuration
const tierConfig = {
  budget: {
    label: 'Budget',
    borderColor: 'border-green-500/40',
    badgeClass: 'bg-green-500/20 text-green-400',
    glowClass: 'group-hover:shadow-green-500/20'
  },
  value: {
    label: 'Best Value',
    borderColor: 'border-cyan-500/40',
    badgeClass: 'bg-cyan-500/20 text-cyan-400',
    glowClass: 'group-hover:shadow-cyan-500/20'
  },
  premium: {
    label: 'Premium',
    borderColor: 'border-purple-500/40',
    badgeClass: 'bg-purple-500/20 text-purple-400',
    glowClass: 'group-hover:shadow-purple-500/20'
  }
}

// Technology colors
const techColors: Record<string, string> = {
  Fiber: 'text-green-400',
  Cable: 'text-blue-400',
  '5G': 'text-purple-400',
  'Fixed Wireless': 'text-cyan-400',
  DSL: 'text-yellow-400',
  Satellite: 'text-orange-400'
}

export function MiniPlanCard({ plan, index = 0, onAskAI }: MiniPlanCardProps) {
  const tier = tierConfig[plan.tier]
  const isSymmetric = plan.uploadSpeed === plan.downloadSpeed

  // Provider ID mapping for affiliate links
  const providerIdMap: Record<string, string> = {
    'frontier-fiber': 'frontier',
    'att-internet': 'att',
    'spectrum': 'spectrum',
    't-mobile': 'tmobile',
    'wow': 'wow',
    'google-fiber': 'google-fiber',
    'starlink': 'starlink',
    'viasat': 'viasat'
  }
  const affiliateProviderId = providerIdMap[plan.providerSlug]
  const orderUrl = affiliateProviderId ? getAffiliateUrl(affiliateProviderId, 'chat') : null

  // Format speed display
  const formatSpeed = (speed: number) => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(speed >= 10000 ? 0 : 1)} Gbps`
    }
    return `${speed} Mbps`
  }

  return (
    <motion.div
      className={`group relative flex-shrink-0 w-64 rounded-xl border ${tier.borderColor} bg-gray-900/90 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg ${tier.glowClass}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tier.badgeClass}`}>
                {tier.label}
              </span>
              <span className={`text-xs ${techColors[plan.technology] || 'text-gray-400'}`}>
                {plan.technology}
              </span>
            </div>
            <h4 className="font-semibold text-white text-sm truncate">{plan.planName}</h4>
            <p className="text-xs text-gray-400">{plan.providerName}</p>
          </div>
        </div>

        {/* Speed & Price */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-lg font-bold text-white">{formatSpeed(plan.downloadSpeed)}</div>
            <div className="text-xs text-gray-500">
              {isSymmetric ? 'symmetric' : `↑ ${formatSpeed(plan.uploadSpeed)}`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white">${plan.price}</div>
            <div className="text-xs text-gray-500">/mo</div>
          </div>
        </div>

        {/* Quick features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {plan.features.slice(0, 2).map((feature, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">
              {feature.length > 20 ? feature.substring(0, 20) + '...' : feature}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {orderUrl ? (
            <a
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-medium py-2 px-3 rounded-lg text-center hover:from-blue-500 hover:to-cyan-500 transition-all"
            >
              Check Availability
            </a>
          ) : (
            <span className="flex-1 bg-gray-700 text-gray-400 text-xs font-medium py-2 px-3 rounded-lg text-center">
              Coming Soon
            </span>
          )}
          {onAskAI && (
            <button
              onClick={() => onAskAI(plan.planName, plan.providerName)}
              className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-cyan-400 hover:bg-gray-700 transition-all"
              title="Ask about this plan"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Value indicator bar at bottom */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500"
          style={{ width: `${Math.min((plan.downloadSpeed / plan.price / 20) * 100, 100)}%` }}
        />
      </div>
    </motion.div>
  )
}
