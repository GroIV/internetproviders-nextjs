/**
 * Fix DISH provider name in tv_plans table
 * Run with: npx tsx scripts/fix-dish-provider-name.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

async function main() {
  console.log('🔧 Fixing DISH provider name in tv_plans table...\n')

  // Update DISH to DISH Network
  const { data, error } = await supabase
    .from('tv_plans')
    .update({ provider_name: 'DISH Network' })
    .eq('provider_name', 'DISH')
    .select()

  if (error) {
    console.log('❌ Error:', error.message)
    return
  }

  console.log(`✅ Updated ${data?.length || 0} DISH plans to use "DISH Network" as provider name`)

  // Verify the fix
  const { data: dishPlans } = await supabase
    .from('tv_plans')
    .select('plan_id, provider_name, package_name')
    .eq('provider_name', 'DISH Network')

  console.log('\n📋 DISH Network plans:')
  dishPlans?.forEach(p => console.log(`   - ${p.package_name}`))
}

main().catch(console.error)
