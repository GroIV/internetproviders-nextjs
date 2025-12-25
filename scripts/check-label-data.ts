import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

const missingProviders = [
  'EarthLink',
  'HughesNet', 
  'Optimum',
  'Verizon',
  'Verizon Fios',
  'Windstream',
  'Rise Broadband',
  'TDS',
  'TDS Telecom',
  'Ziply',
  'Ziply Fiber',
]

async function main() {
  // Get all distinct provider names from broadband_plans
  const { data } = await supabase
    .from('broadband_plans')
    .select('provider_name')
  
  const providerCounts: Record<string, number> = {}
  data?.forEach(row => {
    providerCounts[row.provider_name] = (providerCounts[row.provider_name] || 0) + 1
  })
  
  console.log('=== BROADBAND LABEL DATA STATUS ===\n')
  
  missingProviders.forEach(name => {
    // Check exact match and partial match
    const exactCount = providerCounts[name] || 0
    
    // Check for partial matches
    let partialMatch = ''
    let partialCount = 0
    Object.entries(providerCounts).forEach(([pName, count]) => {
      if (pName.toLowerCase().includes(name.toLowerCase()) || 
          name.toLowerCase().includes(pName.toLowerCase())) {
        if (count > partialCount) {
          partialMatch = pName
          partialCount = count
        }
      }
    })
    
    if (exactCount > 0) {
      console.log('✓ ' + name + ': ' + exactCount + ' plans in database')
    } else if (partialCount > 0) {
      console.log('~ ' + name + ': Found as "' + partialMatch + '" with ' + partialCount + ' plans')
    } else {
      console.log('✗ ' + name + ': NO DATA - needs FCC labels')
    }
  })
  
  console.log('\n=== ALL PROVIDERS IN BROADBAND_PLANS ===\n')
  Object.entries(providerCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => {
      console.log('  ' + name + ': ' + count + ' plans')
    })
}

main()
