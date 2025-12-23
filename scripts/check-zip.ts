import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

async function checkProviders() {
  const zipCode = '78232'

  // Get coverage for ZIP
  const { data: coverage, error: covError } = await supabase
    .from('coverage')
    .select('provider_id')
    .eq('zip_code', zipCode)
    .eq('has_service', true)

  if (covError) {
    console.log('Coverage error:', covError)
    return
  }

  if (!coverage || coverage.length === 0) {
    console.log(`No providers found for ZIP ${zipCode}`)
    return
  }

  const providerIds = [...new Set(coverage.map(c => c.provider_id))]
  console.log('Provider IDs with coverage:', providerIds)

  // Get provider details
  const { data: providers, error: provError } = await supabase
    .from('providers')
    .select('id, name, slug, category, technologies')
    .in('id', providerIds)

  if (provError) {
    console.log('Provider error:', provError)
    return
  }

  console.log(`\nProviders available in ZIP ${zipCode}:`)
  console.log('='.repeat(50))
  providers?.forEach(p => {
    console.log(`- ${p.name}`)
    console.log(`  Category: ${p.category}`)
    console.log(`  Technologies: ${(p.technologies || []).join(', ')}`)
    console.log('')
  })
  console.log(`Total: ${providers?.length} providers`)
}

checkProviders()
