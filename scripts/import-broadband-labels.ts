/**
 * Import FCC Broadband Labels data into Supabase
 * Run with: npx tsx scripts/import-broadband-labels.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import * as XLSX from 'xlsx'

// Supabase client
const supabase = createClient(
  'https://aogfhlompvfztymxrxfm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2ZobG9tcHZmenR5bXhyeGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1Mjc1NiwiZXhwIjoyMDgyMDI4NzU2fQ.51pXr4w2JykDIpFPaIwKwoGeC2r5uEu6QVFm2WAW-yA'
)

// Data paths
const DATA_DIR = resolve(__dirname, '../data/broadband-labels')
const SPECTRUM_RESIDENTIAL_CSV = resolve(DATA_DIR, 'spectrum_residential.csv')
const SPECTRUM_MOBILE_CSV = resolve(DATA_DIR, 'spectrum_mobile.csv')
const TMOBILE_XLSX = resolve(DATA_DIR, 'tmobile.xlsx')
const ATT_CSV = resolve(DATA_DIR, 'att.csv')
const FRONTIER_CSV = resolve(DATA_DIR, 'frontier_combined.csv')

interface BroadbandPlanRecord {
  fcc_plan_id: string
  provider_name: string
  provider_id: number | null
  service_plan_name: string
  tier_plan_name: string | null
  connection_type: string
  service_type: string
  monthly_price: number
  has_intro_rate: boolean
  intro_rate_price: number | null
  intro_rate_months: number | null
  contract_required: boolean
  contract_months: number | null
  contract_terms_url: string | null
  early_termination_fee: number
  one_time_fees: object[]
  monthly_fees: object[]
  tax_info: string | null
  typical_download_speed: number | null
  typical_upload_speed: number | null
  typical_latency: number | null
  monthly_data_gb: number | null
  overage_price_per_gb: number | null
  overage_increment_gb: number | null
  bundle_discounts_url: string | null
  data_allowance_policy_url: string | null
  network_management_url: string | null
  privacy_policy_url: string | null
  support_phone: string | null
  support_url: string | null
  data_source: string
  source_file: string
  is_active: boolean
}

// Parse semicolon-separated fee lists: "Fee1;Fee2" and "10.00;20.00" -> [{name, amount}]
function parseFees(descriptions: string | null, amounts: string | null): object[] {
  if (!descriptions || !amounts) return []

  const descList = descriptions.split(';').map(s => s.trim())
  const amountList = amounts.split(';').map(s => {
    const cleaned = s.replace(/[^\d.]/g, '')
    return parseFloat(cleaned) || 0
  })

  return descList.map((name, i) => ({
    name,
    amount: amountList[i] || 0
  })).filter(f => f.name)
}

// Parse speed string like "475 " or "475 - 622" -> average number
function parseSpeed(speedStr: string | null): number | null {
  if (!speedStr) return null
  const cleaned = speedStr.trim()
  if (!cleaned) return null

  // Handle range like "67  - 622"
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-').map(s => parseFloat(s.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return Math.round((parts[0] + parts[1]) / 2)
    }
  }

  const num = parseFloat(cleaned)
  return isNaN(num) ? null : Math.round(num)
}

// Parse latency string like "22" or "35-58" -> average
function parseLatency(latencyStr: string | null): number | null {
  if (!latencyStr) return null
  const cleaned = latencyStr.trim()

  if (cleaned.includes('-')) {
    const parts = cleaned.split('-').map(s => parseInt(s.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return Math.round((parts[0] + parts[1]) / 2)
    }
  }

  const num = parseInt(cleaned)
  return isNaN(num) ? null : num
}

// Parse CSV content
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  // Parse headers, removing quotes
  const headerLine = lines[0]
  const headers: string[] = []
  let current = ''
  let inQuotes = false
  for (const char of headerLine) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      headers.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  headers.push(current.trim())

  const records: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = []
    current = ''
    inQuotes = false

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    if (values.length >= headers.length) {
      const record: Record<string, string> = {}
      headers.forEach((h, j) => {
        record[h] = values[j] || ''
      })
      records.push(record)
    }
  }

  return records
}

// Parse Spectrum CSV row into our schema
function parseSpectrumRow(row: Record<string, string>, sourceFile: string): BroadbandPlanRecord | null {
  const fccPlanId = row.unique_plan_id
  if (!fccPlanId) return null

  const connectionType = row.connection_type || 'Fixed'
  const isResidential = !sourceFile.toLowerCase().includes('mobile')

  return {
    fcc_plan_id: fccPlanId,
    provider_name: row.provider_name || 'Spectrum',
    provider_id: null, // Will be matched later
    service_plan_name: row.service_plan_name || 'Internet',
    tier_plan_name: row.tier_plan_name === 'NULL' ? null : row.tier_plan_name,
    connection_type: connectionType === 'Mobile' ? 'Mobile' : 'Fixed',
    service_type: isResidential ? 'residential' : 'mobile',
    monthly_price: parseFloat(row.monthly_price) || 0,
    has_intro_rate: row.intro_rate?.toLowerCase() === 'yes',
    intro_rate_price: row.intro_rate_price ? parseFloat(row.intro_rate_price) : null,
    intro_rate_months: row.intro_rate_time ? parseInt(row.intro_rate_time) : null,
    contract_required: row.contract_req?.toLowerCase() === 'yes',
    contract_months: row.contract_time ? parseInt(row.contract_time) : null,
    contract_terms_url: row.contract_terms_url || null,
    early_termination_fee: parseFloat(row.early_termination_fee) || 0,
    one_time_fees: parseFees(row.single_purchase_fee_descr, row.single_purchase_fees),
    monthly_fees: parseFees(row.monthly_provider_fee_descr, row.monthly_provider_fees),
    tax_info: row.tax || null,
    typical_download_speed: parseSpeed(row.typical_download_speed),
    typical_upload_speed: parseSpeed(row.typical_upload_speed),
    typical_latency: parseLatency(row.typical_latency),
    monthly_data_gb: row.monthly_data_allow && row.monthly_data_allow !== 'NULL'
      ? parseInt(row.monthly_data_allow)
      : null,
    overage_price_per_gb: row.over_usage_data_price ? parseFloat(row.over_usage_data_price) : null,
    overage_increment_gb: row.additional_data_increments ? parseInt(row.additional_data_increments) : null,
    bundle_discounts_url: row.bundle_discounts_url || null,
    data_allowance_policy_url: row.data_allowance_policy_url || null,
    network_management_url: row.network_management_policy_url || null,
    privacy_policy_url: row.privacy_policy_url || null,
    support_phone: row.customer_support_phone || null,
    support_url: row.customer_support_web || null,
    data_source: 'fcc_broadband_labels',
    source_file: sourceFile,
    is_active: true
  }
}

// Parse T-Mobile price string like "1 line| $35|2 lines| $95|..." -> first price
function parseTMobilePrice(priceStr: string | null): number {
  if (!priceStr) return 0
  // Find first dollar amount
  const match = String(priceStr).match(/\$(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : 0
}

// Parse T-Mobile speed string like "245 Mbps Down / 31 Mbps Up" or "5G speeds"
function parseTMobileSpeed(speedStr: string | null): { down: number | null; up: number | null } {
  if (!speedStr) return { down: null, up: null }
  const str = String(speedStr)

  const downMatch = str.match(/(\d+)\s*(?:Mbps|Gbps)?\s*(?:Down|download)/i)
  const upMatch = str.match(/(\d+)\s*(?:Mbps|Gbps)?\s*(?:Up|upload)/i)

  let down = downMatch ? parseInt(downMatch[1]) : null
  let up = upMatch ? parseInt(upMatch[1]) : null

  // Check for Gbps
  if (str.toLowerCase().includes('gbps') && down && down < 100) {
    down = down * 1000
  }
  if (str.toLowerCase().includes('gbps') && up && up < 100) {
    up = up * 1000
  }

  return { down, up }
}

// Parse T-Mobile XLSX row
function parseTMobileRow(row: Record<string, any>, sourceFile: string): BroadbandPlanRecord | null {
  const planId = row.UniquePlanIdentifier || row.planId || row.unique_plan_id
  if (!planId) return null

  const planName = String(row.planName || '')
  const provider = String(row.planProvider || 'T-Mobile')

  // Determine if it's home internet vs mobile
  const isHomeInternet = planName.toLowerCase().includes('home') ||
                         planName.toLowerCase().includes('gateway') ||
                         planName.toLowerCase().includes('5g internet') ||
                         planName.toLowerCase().includes('fixed wireless')

  // Parse speeds
  const speeds = parseTMobileSpeed(row.speedsProvided)

  // Parse price (get first line price)
  const price = parseTMobilePrice(row.monthlyPrice)

  // Skip plans with no price
  if (price === 0) return null

  // Parse data allowance
  let dataGb: number | null = null
  const dataStr = String(row.monthlyDataIncluded || '')
  if (dataStr.toLowerCase().includes('unlimited')) {
    dataGb = null // unlimited
  } else {
    const dataMatch = dataStr.match(/(\d+)\s*(?:GB|gb)/i)
    if (dataMatch) {
      dataGb = parseInt(dataMatch[1])
    }
  }

  return {
    fcc_plan_id: String(planId),
    provider_name: provider.includes('T-Mobile') ? 'T-Mobile' : provider,
    provider_id: null,
    service_plan_name: planName,
    tier_plan_name: null,
    connection_type: isHomeInternet ? 'Fixed' : 'Mobile',
    service_type: isHomeInternet ? 'residential' : 'mobile',
    monthly_price: price,
    has_intro_rate: false,
    intro_rate_price: null,
    intro_rate_months: null,
    contract_required: false,
    contract_months: null,
    contract_terms_url: null,
    early_termination_fee: 0,
    one_time_fees: [],
    monthly_fees: [],
    tax_info: 'Taxes Included',
    typical_download_speed: speeds.down,
    typical_upload_speed: speeds.up,
    typical_latency: null,
    monthly_data_gb: dataGb,
    overage_price_per_gb: null,
    overage_increment_gb: null,
    bundle_discounts_url: row.discountsBundles || null,
    data_allowance_policy_url: null,
    network_management_url: row.networkManagementPolicy || null,
    privacy_policy_url: row.privacyPolicy || null,
    support_phone: null,
    support_url: row.customerSupport || null,
    data_source: 'fcc_broadband_labels',
    source_file: sourceFile,
    is_active: true
  }
}

async function importSpectrumCSV(csvPath: string, fileName: string): Promise<BroadbandPlanRecord[]> {
  if (!existsSync(csvPath)) {
    console.log(`  ⚠️ File not found: ${fileName}`)
    return []
  }

  const content = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)
  const records: BroadbandPlanRecord[] = []

  for (const row of rows) {
    const record = parseSpectrumRow(row, fileName)
    if (record) {
      records.push(record)
    }
  }

  console.log(`  ✅ Parsed ${records.length} plans from ${fileName}`)
  return records
}

async function importTMobileXLSX(xlsxPath: string, fileName: string): Promise<BroadbandPlanRecord[]> {
  if (!existsSync(xlsxPath)) {
    console.log(`  ⚠️ File not found: ${fileName}`)
    return []
  }

  const workbook = XLSX.readFile(xlsxPath)
  const records: BroadbandPlanRecord[] = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet)

    for (const row of rows) {
      const record = parseTMobileRow(row as Record<string, any>, fileName)
      if (record) {
        records.push(record)
      }
    }
  }

  // Count home internet vs mobile
  const homeInternetCount = records.filter(r => r.service_type === 'residential').length
  const mobileCount = records.filter(r => r.service_type === 'mobile').length

  console.log(`  ✅ Parsed ${records.length} plans from ${fileName}`)
  console.log(`     - ${homeInternetCount} home internet plans`)
  console.log(`     - ${mobileCount} mobile plans`)

  return records
}

// Parse AT&T speed string like "12-78 Mbps (4G LTE); 53-304 Mbps (5G)" -> average of first range
function parseATTSpeed(speedStr: string | null): number | null {
  if (!speedStr) return null
  // Get first range
  const match = String(speedStr).match(/(\d+)-(\d+)\s*(?:Mbps|Gbps)/i)
  if (match) {
    const low = parseInt(match[1])
    const high = parseInt(match[2])
    return Math.round((low + high) / 2)
  }
  return null
}

// Parse AT&T latency string like "29-52 ms (4G LTE)" -> average
function parseATTLatency(latencyStr: string | null): number | null {
  if (!latencyStr) return null
  const match = String(latencyStr).match(/(\d+)-(\d+)\s*ms/i)
  if (match) {
    return Math.round((parseInt(match[1]) + parseInt(match[2])) / 2)
  }
  return null
}

// Parse AT&T data allowance like "20GB" or "Unlimited"
function parseATTDataAllowance(dataStr: string | null): number | null {
  if (!dataStr) return null
  if (dataStr.toLowerCase() === 'unlimited') return null
  const match = String(dataStr).match(/(\d+)\s*(?:GB|MB)/i)
  if (match) {
    const value = parseInt(match[1])
    return dataStr.toLowerCase().includes('mb') ? Math.round(value / 1024) : value
  }
  return null
}

// Parse AT&T CSV row
function parseATTRow(row: Record<string, string>, sourceFile: string): BroadbandPlanRecord | null {
  const fccPlanId = row.FCCPlanId
  if (!fccPlanId) return null

  const serviceType = row.serviceType || 'Fixed'
  const isResidential = serviceType === 'Fixed'
  const price = parseFloat(String(row.priceAmount || '0').replace('*', '')) || 0

  if (price === 0) return null

  // Parse one-time fees
  const oneTimeFees: object[] = []
  if (row.onTimeyFeeType && row.oneTimeFee) {
    const feeTypes = String(row.onTimeyFeeType).split(';')
    const feeAmounts = String(row.oneTimeFee).split(';')
    feeTypes.forEach((type, i) => {
      const amount = parseFloat(feeAmounts[i]) || 0
      if (type.trim() && amount > 0) {
        oneTimeFees.push({ name: type.trim(), amount })
      }
    })
  }

  // Parse monthly fees
  const monthlyFees: object[] = []
  if (row.monthlyFeeType && row.monthlyFee) {
    const feeTypes = String(row.monthlyFeeType).split(';')
    const feeAmounts = String(row.monthlyFee).split(';')
    feeTypes.forEach((type, i) => {
      const amount = parseFloat(feeAmounts[i]) || 0
      if (type.trim() && amount > 0) {
        monthlyFees.push({ name: type.trim(), amount })
      }
    })
  }

  return {
    fcc_plan_id: fccPlanId,
    provider_name: 'AT&T',
    provider_id: null,
    service_plan_name: row.planName || 'Internet',
    tier_plan_name: null,
    connection_type: serviceType === 'Mobile' ? 'Mobile' : 'Fixed',
    service_type: isResidential ? 'residential' : 'mobile',
    monthly_price: price,
    has_intro_rate: row.introductoryRateValue === 'is',
    intro_rate_price: null,
    intro_rate_months: row.introductoryPeriodLength ? parseInt(row.introductoryPeriodLength) : null,
    contract_required: row.contractStatus?.includes('requires') || false,
    contract_months: row.contractPeriod ? parseInt(row.contractPeriod) : null,
    contract_terms_url: row.contractLinkURL || null,
    early_termination_fee: parseFloat(row.terminationFee) || 0,
    one_time_fees: oneTimeFees,
    monthly_fees: monthlyFees,
    tax_info: row.tax || null,
    typical_download_speed: parseATTSpeed(row.speedsDownloadSpeed),
    typical_upload_speed: parseATTSpeed(row.speedsUploadSpeed),
    typical_latency: parseATTLatency(row.speedsLatency),
    monthly_data_gb: parseATTDataAllowance(row.dataMonthly),
    overage_price_per_gb: null,
    overage_increment_gb: null,
    bundle_discounts_url: row.discountsBundlesLinks || null,
    data_allowance_policy_url: row.dataDetailsLinkText || null,
    network_management_url: row.networkPolicyLinkText || null,
    privacy_policy_url: row.privacyPolicylinkText || null,
    support_phone: row.contactUsNumbers || null,
    support_url: row.customerSupportlinkText || null,
    data_source: 'fcc_broadband_labels',
    source_file: sourceFile,
    is_active: true
  }
}

async function importATTCSV(csvPath: string, fileName: string): Promise<BroadbandPlanRecord[]> {
  if (!existsSync(csvPath)) {
    console.log(`  ⚠️ File not found: ${fileName}`)
    return []
  }

  const content = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)
  const records: BroadbandPlanRecord[] = []

  for (const row of rows) {
    const record = parseATTRow(row, fileName)
    if (record) {
      records.push(record)
    }
  }

  const fixedCount = records.filter(r => r.service_type === 'residential').length
  const mobileCount = records.filter(r => r.service_type === 'mobile').length

  console.log(`  ✅ Parsed ${records.length} plans from ${fileName}`)
  console.log(`     - ${fixedCount} fixed/residential plans`)
  console.log(`     - ${mobileCount} mobile plans`)

  return records
}

// Parse Frontier CSV row (similar to Spectrum but speeds in Kbps)
function parseFrontierRow(row: Record<string, string>, sourceFile: string): BroadbandPlanRecord | null {
  const fccPlanId = row.unique_plan_id
  if (!fccPlanId) return null

  // Skip header rows that got duplicated
  if (fccPlanId === 'unique_plan_id') return null

  const price = parseFloat(row.monthly_price) || 0
  if (price === 0) return null

  // Frontier speeds are in Kbps, convert to Mbps
  const downloadKbps = parseInt(row.typical_download_speed) || 0
  const uploadKbps = parseInt(row.typical_upload_speed) || 0
  const downloadMbps = downloadKbps >= 1000 ? Math.round(downloadKbps / 1000) : downloadKbps
  const uploadMbps = uploadKbps >= 1000 ? Math.round(uploadKbps / 1000) : uploadKbps

  return {
    fcc_plan_id: fccPlanId,
    provider_name: 'Frontier',
    provider_id: null,
    service_plan_name: row.service_plan_name || 'Internet',
    tier_plan_name: row.tier_plan_name || null,
    connection_type: row.connection_type || 'Fixed',
    service_type: 'residential',
    monthly_price: price,
    has_intro_rate: row.intro_rate?.toLowerCase() === 'yes',
    intro_rate_price: row.intro_rate_price ? parseFloat(row.intro_rate_price) : null,
    intro_rate_months: row.intro_rate_time ? parseInt(row.intro_rate_time) : null,
    contract_required: row.contract_req?.toLowerCase() === 'yes',
    contract_months: row.contract_time ? parseInt(row.contract_time) : null,
    contract_terms_url: row.contract_terms_url || null,
    early_termination_fee: parseFloat(row.early_termination_fee) || 0,
    one_time_fees: [],
    monthly_fees: [],
    tax_info: row.tax || null,
    typical_download_speed: downloadMbps,
    typical_upload_speed: uploadMbps,
    typical_latency: parseInt(row.typical_latency) || null,
    monthly_data_gb: null, // Frontier is unlimited
    overage_price_per_gb: null,
    overage_increment_gb: null,
    bundle_discounts_url: row.bundle_discounts_url || null,
    data_allowance_policy_url: row.data_allowance_policy_url || null,
    network_management_url: row.network_management_policy_url || null,
    privacy_policy_url: row.privacy_policy_url || null,
    support_phone: row.customer_support_phone || null,
    support_url: row.customer_support_web || null,
    data_source: 'fcc_broadband_labels',
    source_file: sourceFile,
    is_active: true
  }
}

async function importFrontierCSV(csvPath: string, fileName: string): Promise<BroadbandPlanRecord[]> {
  if (!existsSync(csvPath)) {
    console.log(`  ⚠️ File not found: ${fileName}`)
    return []
  }

  const content = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)
  const records: BroadbandPlanRecord[] = []

  for (const row of rows) {
    const record = parseFrontierRow(row, fileName)
    if (record) {
      records.push(record)
    }
  }

  console.log(`  ✅ Parsed ${records.length} plans from ${fileName}`)
  return records
}

async function matchProvidersIds(records: BroadbandPlanRecord[]): Promise<void> {
  console.log('\n🔗 Matching provider IDs...')

  // Fetch providers from database
  const { data: providers, error } = await supabase
    .from('providers')
    .select('id, name, slug')

  if (error || !providers) {
    console.log('  ⚠️ Could not fetch providers:', error?.message)
    return
  }

  // Create lookup map
  const providerMap = new Map<string, number>()
  providers.forEach((p: { id: number; name: string; slug: string }) => {
    providerMap.set(p.name.toLowerCase(), p.id)
    providerMap.set(p.slug?.toLowerCase(), p.id)
  })

  // Match records
  let matched = 0
  for (const record of records) {
    const name = record.provider_name.toLowerCase()

    // Try exact match
    if (providerMap.has(name)) {
      record.provider_id = providerMap.get(name)!
      matched++
      continue
    }

    // Try partial match
    for (const [key, id] of providerMap) {
      if (name.includes(key) || key.includes(name)) {
        record.provider_id = id
        matched++
        break
      }
    }
  }

  console.log(`  ✅ Matched ${matched}/${records.length} plans to provider IDs`)
}

async function insertRecords(records: BroadbandPlanRecord[]): Promise<void> {
  console.log(`\n💾 Inserting ${records.length} plans into database...`)

  // Normalize provider names
  const providerNameMap: Record<string, string> = {
    'Assurance wireless plan': 'T-Mobile',
    'Sprint plan': 'T-Mobile',
    'Metro by T-Mobile plan': 'T-Mobile',
    'Frontier Communications': 'Frontier',
    'AT&T Internet': 'AT&T'
  }

  for (const record of records) {
    if (providerNameMap[record.provider_name]) {
      record.provider_name = providerNameMap[record.provider_name]
    }
  }

  // Remove duplicates by FCC plan ID (keep last occurrence)
  const uniqueRecords = new Map<string, BroadbandPlanRecord>()
  for (const record of records) {
    uniqueRecords.set(record.fcc_plan_id, record)
  }
  const deduped = Array.from(uniqueRecords.values())
  console.log(`  Deduplicated: ${records.length} -> ${deduped.length} unique plans`)

  // Clear existing data for these providers
  const providers = [...new Set(deduped.map(r => r.provider_name))]
  console.log(`  Clearing existing plans for: ${providers.join(', ')}`)

  for (const provider of providers) {
    const { error } = await supabase
      .from('broadband_plans')
      .delete()
      .eq('provider_name', provider)

    if (error && !error.message.includes('does not exist')) {
      console.log(`  ⚠️ Error clearing ${provider}:`, error.message)
    }
  }

  // Insert in batches using upsert
  const batchSize = 50
  let inserted = 0
  let errors = 0

  for (let i = 0; i < deduped.length; i += batchSize) {
    const batch = deduped.slice(i, i + batchSize)

    const { error } = await supabase
      .from('broadband_plans')
      .upsert(batch, { onConflict: 'fcc_plan_id' })

    if (error) {
      console.log(`  ❌ Batch ${Math.floor(i/batchSize) + 1} error:`, error.message)
      errors += batch.length

      // If table doesn't exist, stop
      if (error.message.includes('does not exist')) {
        console.log('\n  ⚠️ Table "broadband_plans" does not exist. Please run the migration first:')
        console.log('     Run the SQL in: supabase/migrations/20241224_broadband_plans.sql')
        return
      }
    } else {
      inserted += batch.length
    }
  }

  console.log(`  ✅ Inserted ${inserted} plans (${errors} errors)`)
}

async function showSummary(): Promise<void> {
  console.log('\n📊 Summary:')

  const { data: summary, error } = await supabase
    .from('broadband_plans')
    .select('provider_name, service_type')

  if (error) {
    console.log('  Could not fetch summary:', error.message)
    return
  }

  // Count by provider
  const byProvider = new Map<string, number>()
  const byType = new Map<string, number>()

  for (const row of summary || []) {
    byProvider.set(row.provider_name, (byProvider.get(row.provider_name) || 0) + 1)
    byType.set(row.service_type, (byType.get(row.service_type) || 0) + 1)
  }

  console.log('\n  Plans by Provider:')
  for (const [provider, count] of byProvider) {
    console.log(`    - ${provider}: ${count}`)
  }

  console.log('\n  Plans by Type:')
  for (const [type, count] of byType) {
    console.log(`    - ${type}: ${count}`)
  }
}

async function main() {
  console.log('🚀 FCC Broadband Labels Import\n')
  console.log('=' .repeat(50))

  const allRecords: BroadbandPlanRecord[] = []

  // Import Spectrum Residential
  console.log('\n📁 Processing Spectrum Residential...')
  const spectrumResidential = await importSpectrumCSV(SPECTRUM_RESIDENTIAL_CSV, 'spectrum_residential.csv')
  allRecords.push(...spectrumResidential)

  // Import Spectrum Mobile
  console.log('\n📁 Processing Spectrum Mobile...')
  const spectrumMobile = await importSpectrumCSV(SPECTRUM_MOBILE_CSV, 'spectrum_mobile.csv')
  allRecords.push(...spectrumMobile)

  // Import T-Mobile
  console.log('\n📁 Processing T-Mobile...')
  const tmobile = await importTMobileXLSX(TMOBILE_XLSX, 'tmobile.xlsx')
  allRecords.push(...tmobile)

  // Import AT&T
  console.log('\n📁 Processing AT&T...')
  const att = await importATTCSV(ATT_CSV, 'att.csv')
  allRecords.push(...att)

  // Import Frontier
  console.log('\n📁 Processing Frontier...')
  const frontier = await importFrontierCSV(FRONTIER_CSV, 'frontier_combined.csv')
  allRecords.push(...frontier)

  // Match provider IDs
  await matchProvidersIds(allRecords)

  // Insert records
  await insertRecords(allRecords)

  // Show summary
  await showSummary()

  console.log('\n' + '='.repeat(50))
  console.log('✅ Import complete!')
}

main().catch(console.error)
