import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

const providers = [
  'Cox',
  'Breezeline',
  'Astound',
  'Consolidated',
  'Buckeye',
  'Brightspeed',
  'CenturyLink',
  'altafiber'
]

async function getProviderPlans(providerName: string) {
  const { data, error } = await supabase
    .from('broadband_plans')
    .select('*')
    .eq('provider_name', providerName)
    .order('monthly_price', { ascending: true })

  if (error) {
    console.error('Error for ' + providerName + ':', error)
    return []
  }

  return data || []
}

async function main() {
  for (const provider of providers) {
    const plans = await getProviderPlans(provider)

    console.log('\n=== ' + provider + ' (' + plans.length + ' plans) ===')

    if (plans.length === 0) continue

    // Get unique plans by speed tier
    const uniquePlans = new Map()
    plans.forEach(p => {
      const key = p.typical_download_speed + '-' + p.typical_upload_speed
      if (!uniquePlans.has(key)) {
        uniquePlans.set(key, p)
      }
    })

    const sortedPlans = Array.from(uniquePlans.values())
      .sort((a, b) => a.monthly_price - b.monthly_price)

    // Pick budget, value, premium
    const budget = sortedPlans[0]
    const premium = sortedPlans[sortedPlans.length - 1]
    const valueIndex = Math.floor(sortedPlans.length / 2)
    const value = sortedPlans[valueIndex]

    const selected = [budget, value, premium].filter((p, i, arr) =>
      arr.findIndex(x => x?.plan_id === p?.plan_id) === i
    )

    selected.forEach((plan, i) => {
      const tier = i === 0 ? 'budget' : i === selected.length - 1 ? 'premium' : 'value'
      console.log('[' + tier + '] ' + plan.service_plan_name)
      console.log('  Price: $' + plan.monthly_price + '/mo')
      console.log('  Speed: ' + plan.typical_download_speed + '/' + plan.typical_upload_speed + ' Mbps')
      console.log('  Technology: ' + plan.connection_type)
      console.log('  Latency: ' + plan.typical_latency + 'ms')
      const dataCap = plan.monthly_data_gb ? plan.monthly_data_gb + ' GB' : 'Unlimited'
      console.log('  Data Cap: ' + dataCap)
    })
  }
}

main()
