import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

// Providers with featured plans
const hasPlans = new Set([
  'frontier-fiber',
  'att-internet', 
  'spectrum',
  't-mobile',
  'wow',
  'google-fiber',
  'starlink',
  'viasat',
  'xfinity',
  'metronet',
  'cox',
  'breezeline',
  'astound-broadband',
  'consolidated-communications',
  'buckeye-cable',
  'brightspeed',
  'centurylink',
  'altafiber',
])

// Sellable providers (from affiliates.ts)
const sellable = new Set([
  'altafiber',
  'att-internet',
  'breezeline',
  'brightspeed',
  'buckeye-cable',
  'centurylink',
  'cox',
  'dish',
  'directv',
  'earthlink',
  'frontier',
  'frontier-fiber',
  'google-fiber',
  'hughesnet',
  'optimum',
  'spectrum',
  't-mobile',
  'verizon-fios',
  'windstream',
  'wow',
  'xfinity',
])

async function main() {
  // Get all internet providers from database
  const { data: providers } = await supabase
    .from('providers')
    .select('slug, name, category')
    .eq('category', 'Internet')
    .order('name')

  console.log('=== SELLABLE PROVIDERS MISSING FEATURED PLANS ===\n')
  
  const missingSellable: string[] = []
  sellable.forEach(slug => {
    if (!hasPlans.has(slug) && slug !== 'dish' && slug !== 'directv') {
      missingSellable.push(slug)
    }
  })
  
  missingSellable.forEach(slug => {
    console.log('  - ' + slug)
  })
  
  console.log('\n=== ALL INTERNET PROVIDERS IN DATABASE ===\n')
  
  const missing: string[] = []
  const covered: string[] = []
  
  providers?.forEach(p => {
    if (hasPlans.has(p.slug)) {
      covered.push(p.name + ' (' + p.slug + ')')
    } else {
      missing.push(p.name + ' (' + p.slug + ')')
    }
  })
  
  console.log('WITH Featured Plans (' + covered.length + '):')
  covered.forEach(p => console.log('  ✓ ' + p))
  
  console.log('\nMISSING Featured Plans (' + missing.length + '):')
  missing.forEach(p => console.log('  ✗ ' + p))
}

main()
