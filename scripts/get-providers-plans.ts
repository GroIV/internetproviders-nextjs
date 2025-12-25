import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

const BASE_PATH = '/Users/groiv/Python Sandbox/Internet Provders AI 1/BB Facts Lables'

const newProviders = [
  { jsonPath: `${BASE_PATH}/verizon_fios_broadband_labels/verizon_extracted_plans.json`, providerName: 'Verizon Fios' },
  { jsonPath: `${BASE_PATH}/optimum_broadband_labels/optimum_extracted_plans.json`, providerName: 'Optimum' },
  { jsonPath: `${BASE_PATH}/windstream_broadband_labels/windstream_extracted_plans.json`, providerName: 'Windstream' },
  { jsonPath: `${BASE_PATH}/ziply_fiber_broadband_labels/ziply_extracted_plans.json`, providerName: 'Ziply Fiber' },
  { jsonPath: `${BASE_PATH}/tds_telecom_broadband_labels/tds_extracted_plans.json`, providerName: 'TDS Telecom' },
  { jsonPath: `${BASE_PATH}/hughesnet_broadband_labels/hughesnet_extracted_plans.json`, providerName: 'HughesNet' },
]

async function importProvider(jsonPath: string, providerName: string) {
  const rawData = fs.readFileSync(jsonPath, 'utf-8')
  const plans = JSON.parse(rawData)

  // Filter valid plans (with price and speed data)
  const validPlans = plans.filter((p: any) =>
    p.monthly_price && p.monthly_price > 0 &&
    (p.download_speed || p.connection_type === 'Satellite')
  )

  console.log(`${providerName}: ${plans.length} total, ${validPlans.length} valid`)

  // Map to database format
  const dbPlans = validPlans.map((p: any, i: number) => ({
    fcc_plan_id: `OCR-${providerName.replace(/\s/g, '')}-${i}-${Date.now()}`,
    provider_name: providerName,
    service_plan_name: p.plan_name,
    connection_type: p.connection_type,
    service_type: p.service_type || 'residential',
    monthly_price: p.monthly_price,
    typical_download_speed: p.download_speed,
    typical_upload_speed: p.upload_speed,
    typical_latency: p.latency,
    monthly_data_gb: p.data_cap_gb,
    data_source: 'ocr_extracted',
    source_file: p.filename,
    is_active: true,
    contract_required: false,
    has_intro_rate: false,
    early_termination_fee: 0,
    one_time_fees: [],
    monthly_fees: []
  }))

  if (dbPlans.length > 0) {
    const { error } = await supabase.from('broadband_plans').insert(dbPlans)
    if (error) console.error(`  Error: ${error.message}`)
    else console.log(`  Inserted ${dbPlans.length} plans`)
  }
}

async function main() {
  console.log('=== Importing New Providers ===\n')

  for (const p of newProviders) {
    await importProvider(p.jsonPath, p.providerName)
  }

  console.log('\n=== Verifying ===')
  for (const p of newProviders) {
    const { count } = await supabase
      .from('broadband_plans')
      .select('*', { count: 'exact', head: true })
      .eq('provider_name', p.providerName)
    console.log(`${p.providerName}: ${count} plans`)
  }
}

main()
