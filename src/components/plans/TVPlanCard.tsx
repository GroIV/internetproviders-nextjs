'use client'

import { motion } from 'framer-motion'
import { OrderButton } from '@/components/OrderButton'

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

interface TVPlanCardProps {
  plan: TVPlan
  providerSlug: string
  index: number
  isPopular?: boolean
}

export function TVPlanCard({ plan, providerSlug, index, isPopular }: TVPlanCardProps) {
  const hasRSNFee = plan.rsn_fee_max > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative bg-gray-800/50 border rounded-xl p-6 hover:border-blue-500/50 transition-all ${
        isPopular ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : 'border-gray-700'
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">{plan.package_name}</h3>
        <p className="text-gray-400 text-sm">{plan.channel_count_text} channels</p>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">${plan.total_min.toFixed(2)}</span>
          <span className="text-gray-400">/mo</span>
        </div>
        {hasRSNFee && (
          <p className="text-sm text-gray-500 mt-1">
            Up to ${plan.total_max.toFixed(2)}/mo with RSN fee
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Base: ${plan.base_price}/mo + ${plan.gemini_fee} Gemini fee
        </p>
      </div>

      {/* Premium Channels */}
      {plan.premium_channels && plan.premium_channels.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-300 mb-2">Premium Channels Included:</p>
          <div className="flex flex-wrap gap-1">
            {plan.premium_channels.map((channel, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded"
              >
                {channel}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      {plan.features && plan.features.length > 0 && (
        <div className="mb-4">
          <ul className="space-y-1">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contract Info */}
      <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Contract:</span>
            <span className="text-gray-300 ml-1">{plan.contract_months} mo</span>
          </div>
          <div>
            <span className="text-gray-500">Activation:</span>
            <span className="text-gray-300 ml-1">${plan.activation_fee}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ETF: {plan.early_termination_fee}
        </p>
      </div>

      {/* Notes */}
      {plan.notes && (
        <p className="text-xs text-gray-500 mb-4 italic">{plan.notes}</p>
      )}

      {/* CTA */}
      <OrderButton
        providerId={providerSlug}
        providerName={plan.provider_name}
        variant="primary"
        size="md"
        className="w-full"
      />
    </motion.div>
  )
}
