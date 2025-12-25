import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

async function main() {
  const { data, error } = await supabase
    .from('broadband_plans')
    .select('*')
    .limit(1)
  
  if (data && data[0]) {
    console.log('Column names:')
    Object.keys(data[0]).forEach(key => {
      console.log('  ' + key + ': ' + data[0][key])
    })
  }
}

main()
