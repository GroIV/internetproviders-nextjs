import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

interface ProviderConfig {
  dbName: string
  displayName: string
  slug: string
}

const providers: ProviderConfig[] = [
  { dbName: 'Cox', displayName: 'Cox', slug: 'cox' },
  { dbName: 'Breezeline', displayName: 'Breezeline', slug: 'breezeline' },
  { dbName: 'Astound', displayName: 'Astound Broadband', slug: 'astound-broadband' },
  { dbName: 'Consolidated', displayName: 'Consolidated Communications', slug: 'consolidated-communications' },
  { dbName: 'Buckeye', displayName: 'Buckeye Broadband', slug: 'buckeye-cable' },
  { dbName: 'Brightspeed', displayName: 'Brightspeed', slug: 'brightspeed' },
  { dbName: 'CenturyLink', displayName: 'CenturyLink', slug: 'centurylink' },
  { dbName: 'altafiber', displayName: 'altafiber', slug: 'altafiber' },
]

async function getProviderPlans(providerName: string) {
  const { data, error } = await supabase
    .from('broadband_plans')
    .select('*')
    .eq('provider_name', providerName)
    .eq('service_type', 'residential')
    .order('monthly_price', { ascending: true })

  if (error) {
    console.error('Error for ' + providerName + ':', error)
    return []
  }

  return data || []
}

function getTechnology(connectionType: string): string {
  const typeMap: Record<string, string> = {
    'Fiber': 'Fiber',
    'Cable': 'Cable',
    'DSL': 'DSL',
    '5G': '5G',
    'Fixed Wireless': 'Fixed Wireless',
    'Satellite': 'Satellite',
  }
  return typeMap[connectionType] || 'Cable'
}

function formatSpeed(speed: number | null): number {
  if (!speed) return 0
  return Math.round(speed)
}

async function main() {
  console.log('// Generated featured plans for additional providers\n')

  for (const provider of providers) {
    const plans = await getProviderPlans(provider.dbName)

    if (plans.length === 0) {
      console.log('// No plans found for ' + provider.dbName)
      continue
    }

    // Filter out plans with null speeds and sort by download speed
    const validPlans = plans.filter(p =>
      p.typical_download_speed &&
      p.monthly_price > 0 &&
      p.monthly_price < 300
    )

    if (validPlans.length === 0) {
      console.log('// No valid plans for ' + provider.dbName)
      continue
    }

    // Get unique plans by speed tier
    const uniquePlans = new Map()
    validPlans.forEach(p => {
      const key = p.typical_download_speed + '-' + p.typical_upload_speed
      if (!uniquePlans.has(key) || uniquePlans.get(key).monthly_price > p.monthly_price) {
        uniquePlans.set(key, p)
      }
    })

    const sortedPlans = Array.from(uniquePlans.values())
      .sort((a, b) => a.typical_download_speed - b.typical_download_speed)

    // Pick 3 plans: budget (lowest), value (middle-high speed), premium (highest)
    let selectedPlans: any[] = []

    if (sortedPlans.length >= 3) {
      const budget = sortedPlans[0]
      const premium = sortedPlans[sortedPlans.length - 1]
      // Value should be a good middle option - around 500-1000 Mbps if available
      const valueOptions = sortedPlans.filter(p =>
        p.typical_download_speed >= 200 &&
        p.typical_download_speed < premium.typical_download_speed
      )
      const value = valueOptions.length > 0
        ? valueOptions[Math.floor(valueOptions.length / 2)]
        : sortedPlans[Math.floor(sortedPlans.length / 2)]

      selectedPlans = [budget, value, premium].filter((p, i, arr) =>
        arr.findIndex(x => x.fcc_plan_id === p.fcc_plan_id) === i
      )
    } else {
      selectedPlans = sortedPlans
    }

    // Generate TypeScript code
    console.log('  {')
    console.log('    providerId: \'' + provider.slug + '\',')
    console.log('    providerName: \'' + provider.displayName + '\',')
    console.log('    slug: \'' + provider.slug + '\',')
    console.log('    plans: [')

    const tiers = ['budget', 'value', 'premium']
    selectedPlans.forEach((plan, i) => {
      const tier = selectedPlans.length === 1 ? 'value' :
                   selectedPlans.length === 2 ? (i === 0 ? 'budget' : 'premium') :
                   tiers[i]

      const features: string[] = []
      if (!plan.monthly_data_gb) features.push('No data caps')
      if (!plan.contract_required) features.push('No contract')
      if (plan.typical_upload_speed >= plan.typical_download_speed * 0.9) {
        features.push('Symmetric speeds')
      }
      if (plan.connection_type === 'Fiber') features.push('Fiber optic')
      if (plan.typical_latency && plan.typical_latency <= 10) features.push('Low latency')

      const bestFor = tier === 'budget' ? 'Budget-friendly option' :
                      tier === 'value' ? 'Best value for most homes' :
                      'Power users & large households'

      console.log('      {')
      console.log('        planName: \'' + (plan.service_plan_name || 'Internet ' + formatSpeed(plan.typical_download_speed)) + '\',')
      console.log('        price: ' + plan.monthly_price + ',')
      console.log('        downloadSpeed: ' + formatSpeed(plan.typical_download_speed) + ',')
      console.log('        uploadSpeed: ' + formatSpeed(plan.typical_upload_speed) + ',')
      if (plan.typical_latency) {
        console.log('        latency: ' + plan.typical_latency + ',')
      }
      console.log('        technology: \'' + getTechnology(plan.connection_type) + '\',')
      console.log('        features: ' + JSON.stringify(features.slice(0, 4)) + ',')
      console.log('        bestFor: \'' + bestFor + '\',')
      console.log('        tier: \'' + tier + '\'')
      console.log('      }' + (i < selectedPlans.length - 1 ? ',' : ''))
    })

    console.log('    ],')
    console.log('    notes: [')

    // Generate notes based on data
    const notes: string[] = []
    const hasFiber = selectedPlans.some(p => p.connection_type === 'Fiber')
    const hasCable = selectedPlans.some(p => p.connection_type === 'Cable')
    const hasDataCaps = selectedPlans.some(p => p.monthly_data_gb)

    if (hasFiber) notes.push('Fiber plans offer symmetric upload speeds')
    if (hasCable && !hasFiber) notes.push('Cable internet available in most areas')
    if (hasDataCaps) notes.push('Some plans have data caps - check details')
    if (!hasDataCaps) notes.push('No data caps on any plan')

    notes.forEach((note, i) => {
      console.log('      \'' + note + '\'' + (i < notes.length - 1 ? ',' : ''))
    })

    console.log('    ]')
    console.log('  },')
  }
}

main()
