/**
 * Featured residential internet plans for each provider
 * These are curated recommendations based on FCC Broadband Label data
 */

export interface FeaturedPlan {
  planName: string
  price: number
  priceNote?: string
  downloadSpeed: number
  uploadSpeed: number
  latency?: number
  technology: 'Fiber' | 'Cable' | '5G' | 'Fixed Wireless' | 'DSL'
  features: string[]
  bestFor: string
  tier: 'budget' | 'value' | 'premium'
}

export interface ProviderFeaturedPlans {
  providerId: string
  providerName: string
  slug: string
  plans: FeaturedPlan[]
  notes: string[]
}

export const featuredPlans: ProviderFeaturedPlans[] = [
  {
    providerId: 'frontier-fiber',
    providerName: 'Frontier',
    slug: 'frontier-fiber',
    plans: [
      {
        planName: 'Fiber 500 Internet',
        price: 54.99,
        downloadSpeed: 500,
        uploadSpeed: 500,
        latency: 6,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No contract', 'Free equipment'],
        bestFor: 'Best budget fiber - incredible value',
        tier: 'budget'
      },
      {
        planName: 'Fiber 1 Gig Internet',
        price: 74.99,
        downloadSpeed: 1000,
        uploadSpeed: 1000,
        latency: 6,
        technology: 'Fiber',
        features: ['Symmetric gigabit', 'No data caps', 'No contract', '6ms latency'],
        bestFor: 'Sweet spot for most households',
        tier: 'value'
      },
      {
        planName: 'Fiber 5 Gig Internet',
        price: 139.99,
        downloadSpeed: 5000,
        uploadSpeed: 5000,
        latency: 6,
        technology: 'Fiber',
        features: ['5 Gbps symmetric', 'Ultra-low latency', 'Future-proof', 'Professional grade'],
        bestFor: 'Power users & professionals',
        tier: 'premium'
      }
    ],
    notes: [
      'Best overall fiber value in most markets',
      'All plans include symmetric upload speeds',
      '6ms latency is excellent for gaming and video calls',
      'Also offers 2 Gig ($109.99) and 7 Gig ($209.99) tiers'
    ]
  },
  {
    providerId: 'att-internet',
    providerName: 'AT&T',
    slug: 'att-internet',
    plans: [
      {
        planName: 'Internet 300',
        price: 65,
        downloadSpeed: 300,
        uploadSpeed: 300,
        technology: 'Fiber',
        features: ['Symmetric speeds', 'No data caps', 'No annual contract', 'Free installation'],
        bestFor: 'Budget-friendly fiber option',
        tier: 'budget'
      },
      {
        planName: 'Internet 1000',
        price: 90,
        downloadSpeed: 1000,
        uploadSpeed: 1000,
        technology: 'Fiber',
        features: ['Gigabit symmetric', 'No data caps', 'HBO Max included (sometimes)', 'Smart Home Manager app'],
        bestFor: 'Best mainstream fiber value',
        tier: 'value'
      },
      {
        planName: 'Internet 5000',
        price: 255,
        downloadSpeed: 5000,
        uploadSpeed: 5000,
        technology: 'Fiber',
        features: ['5 Gbps symmetric', 'Multi-gig WiFi equipment', 'Priority support', 'Future-proof'],
        bestFor: 'Premium fiber for demanding users',
        tier: 'premium'
      }
    ],
    notes: [
      'AT&T Fiber available in select metro areas',
      'Internet Air ($65/mo) available where fiber is not - uses 5G fixed wireless',
      'All fiber plans have symmetric upload speeds',
      'Equipment included at no extra cost'
    ]
  },
  {
    providerId: 'spectrum',
    providerName: 'Spectrum',
    slug: 'spectrum',
    plans: [
      {
        planName: 'Internet',
        price: 90,
        downloadSpeed: 475,
        uploadSpeed: 11,
        latency: 22,
        technology: 'Cable',
        features: ['No data caps', 'No contracts', 'Free modem', 'Free antivirus'],
        bestFor: 'Entry-level for streaming & browsing',
        tier: 'budget'
      },
      {
        planName: 'Internet Gig',
        price: 95,
        priceNote: 'Starting price varies by location ($85-$110)',
        downloadSpeed: 1000,
        uploadSpeed: 40,
        latency: 22,
        technology: 'Cable',
        features: ['Gigabit download', 'No data caps', '$40/mo intro rate available', 'Advanced WiFi router'],
        bestFor: 'Best value - often cheaper than base plan!',
        tier: 'value'
      },
      {
        planName: 'Internet 2 Gig',
        price: 115,
        priceNote: 'Starting price varies by location ($105-$130)',
        downloadSpeed: 2269,
        uploadSpeed: 1049,
        latency: 22,
        technology: 'Cable',
        features: ['2+ Gbps download', '1 Gbps upload', '$60/mo intro rate', 'Best for large households'],
        bestFor: 'Power users needing fast uploads too',
        tier: 'premium'
      }
    ],
    notes: [
      'No contracts required on any plan',
      'Unlimited data included on all plans',
      'Internet Gig often has promotional pricing below base Internet',
      'Internet 2 Gig offers near-symmetric speeds unlike typical cable'
    ]
  },
  {
    providerId: 't-mobile',
    providerName: 'T-Mobile',
    slug: 't-mobile',
    plans: [
      {
        planName: 'Rely Home Internet',
        price: 55,
        downloadSpeed: 150,
        uploadSpeed: 25,
        technology: '5G',
        features: ['No data caps', 'No contracts', 'No equipment fees', 'Easy self-install'],
        bestFor: 'Budget wireless alternative to cable',
        tier: 'budget'
      },
      {
        planName: 'Home Internet',
        price: 65,
        downloadSpeed: 245,
        uploadSpeed: 31,
        technology: '5G',
        features: ['Unlimited 5G data', 'No annual contracts', 'Price lock guarantee', 'Free gateway device'],
        bestFor: 'Standard 5G home internet',
        tier: 'value'
      },
      {
        planName: 'All-In Home Internet',
        price: 75,
        downloadSpeed: 245,
        uploadSpeed: 31,
        technology: '5G',
        features: ['Unlimited data', 'Premium features', 'Priority network access', 'Enhanced support'],
        bestFor: 'Premium 5G with extras',
        tier: 'premium'
      }
    ],
    notes: [
      'Speeds vary significantly by location and 5G coverage',
      'Great alternative where cable/fiber unavailable',
      'Check coverage at t-mobile.com before ordering',
      'Typical speeds: 100-400+ Mbps where 5G Ultra Capacity available'
    ]
  }
]

// Helper function to get plans for a specific provider
export function getFeaturedPlansForProvider(slug: string): ProviderFeaturedPlans | undefined {
  return featuredPlans.find(p => p.slug === slug || p.providerId === slug)
}

// Helper to get all featured plans as a flat array with provider info
export function getAllFeaturedPlans(): Array<FeaturedPlan & { providerName: string; providerSlug: string }> {
  return featuredPlans.flatMap(provider =>
    provider.plans.map(plan => ({
      ...plan,
      providerName: provider.providerName,
      providerSlug: provider.slug
    }))
  )
}

// Helper to get best value plan across all providers
export function getBestValuePlans(): Array<FeaturedPlan & { providerName: string; providerSlug: string }> {
  return getAllFeaturedPlans()
    .filter(plan => plan.tier === 'value')
    .sort((a, b) => {
      // Sort by value score (speed per dollar)
      const scoreA = a.downloadSpeed / a.price
      const scoreB = b.downloadSpeed / b.price
      return scoreB - scoreA
    })
}

// Format plan for display
export function formatPlanSummary(plan: FeaturedPlan, providerName: string): string {
  const speedStr = plan.uploadSpeed === plan.downloadSpeed
    ? `${plan.downloadSpeed} Mbps symmetric`
    : `${plan.downloadSpeed}/${plan.uploadSpeed} Mbps`

  return `${providerName} ${plan.planName}: $${plan.price}/mo - ${speedStr} (${plan.technology})`
}

// Get comparison text for chat
export function getPlansComparisonText(): string {
  const lines = [
    '## Featured Internet Plans by Provider\n',
  ]

  for (const provider of featuredPlans) {
    lines.push(`### ${provider.providerName}`)
    for (const plan of provider.plans) {
      const speedStr = plan.uploadSpeed === plan.downloadSpeed
        ? `${plan.downloadSpeed}/${plan.uploadSpeed} Mbps`
        : `${plan.downloadSpeed}/${plan.uploadSpeed} Mbps`
      const tierLabel = plan.tier === 'budget' ? 'Budget' : plan.tier === 'value' ? 'Best Value' : 'Premium'
      lines.push(`- **${plan.planName}** ($${plan.price}/mo): ${speedStr} ${plan.technology} - ${tierLabel}`)
    }
    lines.push('')
  }

  lines.push('### Best Value Rankings')
  const valueRanked = getBestValuePlans()
  valueRanked.slice(0, 4).forEach((plan, i) => {
    lines.push(`${i + 1}. ${plan.providerName} ${plan.planName} - $${plan.price}/mo for ${plan.downloadSpeed} Mbps`)
  })

  return lines.join('\n')
}
