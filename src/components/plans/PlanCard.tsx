'use client'

import { motion } from 'framer-motion'
import { SpeedGauge } from './SpeedGauge'
import { useChat } from '@/contexts/ChatContext'
import { getAffiliateUrl } from '@/lib/affiliates'
import type { FeaturedPlan } from '@/lib/featuredPlans'

interface PlanCardProps {
  plan: FeaturedPlan
  providerName: string
  providerSlug: string
  index?: number
  showRecommendation?: boolean
}

// Tier configuration
const tierConfig = {
  budget: {
    label: 'Budget Pick',
    color: 'green',
    borderColor: 'border-green-500/30',
    glowColor: 'hover:shadow-green-500/20',
    badgeClass: 'bg-green-500/20 text-green-400 border-green-500/40',
    gradient: 'from-green-500/10 to-transparent'
  },
  value: {
    label: 'Best Value',
    color: 'cyan',
    borderColor: 'border-cyan-500/30',
    glowColor: 'hover:shadow-cyan-500/20',
    badgeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    gradient: 'from-cyan-500/10 to-transparent'
  },
  premium: {
    label: 'Premium',
    color: 'purple',
    borderColor: 'border-purple-500/30',
    glowColor: 'hover:shadow-purple-500/20',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    gradient: 'from-purple-500/10 to-transparent'
  }
}

// Technology icons
const techIcons: Record<string, React.ReactNode> = {
  Fiber: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Cable: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  '5G': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'Fixed Wireless': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  ),
  DSL: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Satellite: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

export function PlanCard({
  plan,
  providerName,
  providerSlug,
  index = 0,
  showRecommendation = false
}: PlanCardProps) {
  const { sendMessage, setIsOpen } = useChat()
  const tier = tierConfig[plan.tier]

  // Calculate value score (speed per dollar)
  const valueScore = plan.downloadSpeed / plan.price
  const maxValueScore = 20 // Frontier Fiber 1 Gig is about 13.3
  const valuePercent = Math.min((valueScore / maxValueScore) * 100, 100)

  // Check if symmetric speeds
  const isSymmetric = plan.uploadSpeed === plan.downloadSpeed

  const handleDiscussWithAI = () => {
    const message = `Tell me more about ${providerName} ${plan.planName}. Is it a good choice for me?`
    sendMessage(message)
    setIsOpen(true)
  }

  // Get affiliate URL for this provider
  // Note: providerId must match the keys in affiliates.ts
  const affiliateProviderId = providerSlug
  const orderUrl = affiliateProviderId ? getAffiliateUrl(affiliateProviderId, 'plans-page') : null

  return (
    <motion.div
      className={`relative group rounded-2xl border ${tier.borderColor} bg-gradient-to-br from-gray-900/90 to-gray-900/70 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-2xl ${tier.glowColor}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Gradient overlay on top */}
      <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${tier.gradient} pointer-events-none`} />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-current opacity-30 rounded-tl-2xl" style={{ color: tier.color === 'green' ? '#10b981' : tier.color === 'purple' ? '#8b5cf6' : '#06b6d4' }} />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-current opacity-30 rounded-br-2xl" style={{ color: tier.color === 'green' ? '#10b981' : tier.color === 'purple' ? '#8b5cf6' : '#06b6d4' }} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            {/* Tier badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tier.badgeClass}`}>
              {plan.tier === 'value' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                </svg>
              )}
              {tier.label}
            </span>

            {/* Plan name */}
            <h3 className="text-xl font-bold text-white mt-2">{plan.planName}</h3>
            <p className="text-gray-400 text-sm">{providerName}</p>
          </div>

          {/* Technology badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tech-badge-${plan.technology.toLowerCase().replace(' ', '-')}`}>
            {techIcons[plan.technology]}
            <span>{plan.technology}</span>
          </div>
        </div>

        {/* Speed gauges */}
        <div className="flex justify-center gap-6 my-6">
          <div className="text-center">
            <SpeedGauge
              speed={plan.downloadSpeed}
              size="md"
              colorClass={tier.color}
              label="Mbps"
            />
            <div className="text-xs text-gray-500 mt-1">Download</div>
          </div>
          <div className="text-center">
            <SpeedGauge
              speed={plan.uploadSpeed}
              size="md"
              colorClass={isSymmetric ? tier.color : 'blue'}
              label="Mbps"
            />
            <div className="text-xs text-gray-500 mt-1">Upload</div>
          </div>
        </div>

        {/* Symmetric badge */}
        {isSymmetric && (
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Symmetric Speeds
            </span>
          </div>
        )}

        {/* Price */}
        <div className="text-center mb-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-white">${plan.price}</span>
            <span className="text-gray-400">/mo</span>
          </div>
          {plan.priceNote && (
            <p className="text-xs text-gray-500 mt-1">{plan.priceNote}</p>
          )}
        </div>

        {/* Value score bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Value Score</span>
            <span>{valueScore.toFixed(1)} Mbps/$</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full speed-meter-bar rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${valuePercent}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {plan.features.slice(0, 4).map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
              <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Best for */}
        <div className="bg-gray-800/50 rounded-lg p-3 mb-4 border border-gray-700/50">
          <p className="text-xs text-gray-400">
            <span className="font-medium text-gray-300">Best for:</span> {plan.bestFor}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {orderUrl ? (
            <a
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 glow-button text-white font-semibold py-3 px-4 rounded-xl text-center text-sm transition-all"
            >
              Check Availability
            </a>
          ) : (
            <button
              className="flex-1 bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-xl text-sm cursor-not-allowed"
              disabled
            >
              Coming Soon
            </button>
          )}
          <button
            onClick={handleDiscussWithAI}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/80 text-gray-300 rounded-xl border border-gray-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* AI recommendation badge (optional) */}
      {showRecommendation && plan.tier === 'value' && (
        <div className="absolute -top-1 -right-1">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-30" />
            <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              AI Pick
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
