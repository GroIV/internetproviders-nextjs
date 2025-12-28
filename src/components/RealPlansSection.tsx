'use client'

// Type definitions (duplicated to avoid server import)
export interface RealPlan {
  id: number
  planName: string
  tierName: string | null
  connectionType: string
  serviceType: string
  monthlyPrice: number
  hasIntroRate: boolean
  introPrice: number | null
  introMonths: number | null
  downloadSpeed: number | null
  uploadSpeed: number | null
  latency: number | null
  dataGb: number | null
  isUnlimited: boolean
  contractRequired: boolean
  contractMonths: number | null
  earlyTerminationFee: number | null
  oneTimeFees: string | null
  monthlyFees: string | null
  supportPhone: string | null
  collectedAt: string | null
}

// Client-side utility functions (duplicated to avoid server import)
function formatSpeed(speedMbps: number | null): string {
  if (!speedMbps) return 'N/A'
  if (speedMbps >= 1000) {
    const gbps = speedMbps / 1000
    return `${gbps % 1 === 0 ? gbps.toFixed(0) : gbps.toFixed(1)} Gbps`
  }
  return `${speedMbps} Mbps`
}

function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'N/A'
  return `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`
}

function getPlanFeatures(plan: RealPlan): string[] {
  const features: string[] = []

  if (plan.uploadSpeed && plan.downloadSpeed && plan.uploadSpeed === plan.downloadSpeed) {
    features.push('Symmetric speeds')
  }

  if (plan.isUnlimited) {
    features.push('No data caps')
  } else if (plan.dataGb) {
    features.push(`${plan.dataGb} GB/month`)
  }

  if (!plan.contractRequired) {
    features.push('No contract')
  } else if (plan.contractMonths) {
    features.push(`${plan.contractMonths}-month contract`)
  }

  if (plan.hasIntroRate && plan.introPrice) {
    features.push(`Intro rate: ${formatPrice(plan.introPrice)}/mo`)
  }

  if (plan.latency && plan.latency <= 15) {
    features.push(`${plan.latency}ms latency`)
  }

  return features
}

function getTierLabel(tier: 'budget' | 'value' | 'premium'): string {
  switch (tier) {
    case 'budget': return 'Budget Pick'
    case 'value': return 'Best Value'
    case 'premium': return 'Premium'
  }
}

function getTierDescription(plan: RealPlan, tier: 'budget' | 'value' | 'premium'): string {
  const speed = plan.downloadSpeed || 0
  switch (tier) {
    case 'budget':
      if (speed >= 100) return 'Great entry-level option for streaming and browsing'
      return 'Basic internet for light usage'
    case 'value':
      if (speed >= 500) return 'Best balance of speed and price for most households'
      return 'Good all-around option for families'
    case 'premium':
      if (speed >= 1000) return 'Ultra-fast for power users and large households'
      return 'Top-tier speeds for demanding usage'
  }
}

interface RealPlansSectionProps {
  providerName: string
  providerSlug: string
  budget: RealPlan | null
  value: RealPlan | null
  premium: RealPlan | null
  hasFallback: boolean
  collectedAt: string | null
}

// Tier colors
const tierColors = {
  budget: {
    gradient: 'from-emerald-500 to-green-600',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    glow: 'hover:shadow-emerald-500/20',
  },
  value: {
    gradient: 'from-cyan-500 to-blue-600',
    badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    border: 'border-cyan-500/30 hover:border-cyan-500/50',
    glow: 'hover:shadow-cyan-500/20',
  },
  premium: {
    gradient: 'from-purple-500 to-pink-600',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    border: 'border-purple-500/30 hover:border-purple-500/50',
    glow: 'hover:shadow-purple-500/20',
  },
}

function PlanCard({
  plan,
  tier,
  providerName,
}: {
  plan: RealPlan
  tier: 'budget' | 'value' | 'premium'
  providerName: string
}) {
  const colors = tierColors[tier]
  const features = getPlanFeatures(plan)

  return (
    <div
      className={`relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border ${colors.border} transition-all duration-300 hover:shadow-lg ${colors.glow} group`}
    >
      {/* Tier badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors.badge}`}>
          {getTierLabel(tier)}
        </span>
        {tier === 'value' && (
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-medium">
            Recommended
          </span>
        )}
      </div>

      {/* Plan name */}
      <h3 className="text-xl font-bold text-white mb-1">{plan.planName}</h3>
      {plan.tierName && plan.tierName !== plan.planName && (
        <p className="text-sm text-gray-400 mb-4">{plan.tierName}</p>
      )}

      {/* Price */}
      <div className="mb-4">
        <span className={`text-3xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
          {formatPrice(plan.monthlyPrice)}
        </span>
        <span className="text-gray-400 text-sm">/mo</span>
        {plan.hasIntroRate && plan.introPrice && (
          <div className="text-sm text-amber-400 mt-1">
            Intro: {formatPrice(plan.introPrice)}/mo
            {plan.introMonths && ` for ${plan.introMonths} months`}
          </div>
        )}
      </div>

      {/* Speeds */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Download
          </div>
          <div className="font-semibold text-white">{formatSpeed(plan.downloadSpeed)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Upload
          </div>
          <div className="font-semibold text-white">{formatSpeed(plan.uploadSpeed)}</div>
        </div>
      </div>

      {/* Latency if available */}
      {plan.latency && (
        <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Typical Latency</span>
            <span className={`font-medium ${plan.latency <= 15 ? 'text-green-400' : plan.latency <= 30 ? 'text-amber-400' : 'text-gray-300'}`}>
              {plan.latency}ms
            </span>
          </div>
        </div>
      )}

      {/* Features */}
      <ul className="space-y-2 mb-4">
        {features.slice(0, 4).map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* Contract/ETF info */}
      {plan.contractRequired && (
        <div className="text-xs text-gray-500 mb-4">
          {plan.contractMonths && `${plan.contractMonths}-month contract`}
          {plan.earlyTerminationFee && ` • ${formatPrice(plan.earlyTerminationFee)} ETF`}
        </div>
      )}

      {/* Best for description */}
      <p className="text-sm text-gray-400 italic">
        {getTierDescription(plan, tier)}
      </p>
    </div>
  )
}

export function RealPlansSection({
  providerName,
  providerSlug,
  budget,
  value,
  premium,
  hasFallback,
  collectedAt,
}: RealPlansSectionProps) {
  // If no real plans, show fallback message
  if (hasFallback || (!budget && !value && !premium)) {
    return (
      <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur-3xl opacity-10" />
        <div className="relative text-center">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            {providerName} Plans & Pricing
          </h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Plans and pricing vary by location. Contact {providerName} directly or check availability
            at your address to see current plans and promotional offers.
          </p>
          <a
            href={`/go/${providerSlug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:from-amber-400 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-amber-500/20"
          >
            Check {providerName} Availability
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    )
  }

  const availablePlans = [
    budget && { plan: budget, tier: 'budget' as const },
    value && { plan: value, tier: 'value' as const },
    premium && { plan: premium, tier: 'premium' as const },
  ].filter(Boolean) as Array<{ plan: RealPlan; tier: 'budget' | 'value' | 'premium' }>

  return (
    <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50 overflow-hidden">
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-10" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {providerName} Internet Plans
          </h2>
          {collectedAt && (
            <span className="text-xs text-gray-500">
              Data from FCC Broadband Labels
            </span>
          )}
        </div>

        <div className={`grid gap-6 ${availablePlans.length === 3 ? 'md:grid-cols-3' : availablePlans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-md mx-auto'}`}>
          {availablePlans.map(({ plan, tier }) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              tier={tier}
              providerName={providerName}
            />
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-6 text-center">
          Pricing and availability may vary by location. Data sourced from FCC Broadband Consumer Labels.
          {collectedAt && ` Last updated: ${new Date(collectedAt).toLocaleDateString()}`}
        </p>
      </div>
    </div>
  )
}
