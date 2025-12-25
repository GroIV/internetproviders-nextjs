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

// New providers - external directory
const EXTERNAL_DATA_DIR = '/Users/groiv/Python Sandbox/Internet Provders AI 1/BB Facts Lables'
const WOW_CSV = resolve(EXTERNAL_DATA_DIR, 'Wow/WOW Facts Lables.csv')
const VIASAT_CSV = resolve(EXTERNAL_DATA_DIR, 'Viasat/Archived-BNL.csv')
const STARLINK_DIR = resolve(EXTERNAL_DATA_DIR, 'starlink')
const XFINITY_CSV = resolve(EXTERNAL_DATA_DIR, 'Xfinity/xfinity_broadband_labels.csv')
const METRONET_CSV = resolve(EXTERNAL_DATA_DIR, 'Metronet/metronet_broadband_labels.csv')
const COX_JSON = resolve(EXTERNAL_DATA_DIR, 'cox_broadband_labels/cox_extracted_plans.json')
const VERIZON_JSON = resolve(EXTERNAL_DATA_DIR, 'verizon_fios_broadband_labels/verizon_extracted_plans.json')
const CENTURYLINK_JSON = resolve(EXTERNAL_DATA_DIR, 'centurylink_broadband_labels/centurylink_extracted_plans.json')

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

// ============ NEW PROVIDERS ============

// Parse WOW speed with commas like "1,400" -> 1400
function parseWOWSpeed(speedStr: string | null): number | null {
  if (!speedStr) return null
  // Remove Excel formatting like ="95.00" and commas
  const cleaned = String(speedStr).replace(/[="]/g, '').replace(/,/g, '').trim()
  if (!cleaned) return null
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : Math.round(num)
}

// Parse WOW CSV row
function parseWOWRow(row: Record<string, string>, sourceFile: string): BroadbandPlanRecord | null {
  const fccPlanId = row.unique_plan_id?.replace(/"/g, '')
  if (!fccPlanId) return null

  // Parse price - handle Excel format like ="95.00"
  const priceStr = row.monthly_price?.replace(/[="]/g, '') || '0'
  const price = parseFloat(priceStr) || 0
  if (price === 0) return null

  // Parse speeds (may have commas like "1,400")
  const downloadSpeed = parseWOWSpeed(row.typical_download_speed)
  const uploadSpeed = parseWOWSpeed(row.typical_upload_speed)
  const latency = parseWOWSpeed(row.typical_latency)

  // Determine if fiber based on provider name or plan name
  const isFiber = row.provider_name?.toLowerCase().includes('fiber') ||
                  row.service_plan_name?.toLowerCase().includes('fiber')

  return {
    fcc_plan_id: fccPlanId,
    provider_name: 'WOW!',
    provider_id: null,
    service_plan_name: row.service_plan_name || 'Internet',
    tier_plan_name: row.tier_plan_name || null,
    connection_type: isFiber ? 'Fiber' : 'Cable',
    service_type: 'residential',
    monthly_price: price,
    has_intro_rate: row.intro_rate?.toLowerCase() === 'yes',
    intro_rate_price: row.intro_rate_price ? parseFloat(row.intro_rate_price.replace(/[="]/g, '')) : null,
    intro_rate_months: row.intro_rate_time ? parseInt(row.intro_rate_time.replace(/[="]/g, '')) : null,
    contract_required: row.contract_req?.toLowerCase() === 'yes',
    contract_months: row.contract_time ? parseInt(row.contract_time.replace(/[="]/g, '')) : null,
    contract_terms_url: row.contract_terms_url || null,
    early_termination_fee: 0,
    one_time_fees: parseFees(row.single_purchase_fee_descr, row.single_purchase_fees?.replace(/[="]/g, '')),
    monthly_fees: parseFees(row.monthly_provider_fee_descr, row.monthly_provider_fee?.replace(/[="]/g, '')),
    tax_info: row.tax || null,
    typical_download_speed: downloadSpeed,
    typical_upload_speed: uploadSpeed,
    typical_latency: latency,
    monthly_data_gb: null, // WOW is unlimited
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

async function importWOWCSV(csvPath: string, fileName: string): Promise<BroadbandPlanRecord[]> {
  if (!existsSync(csvPath)) {
    console.log(`  ⚠️ File not found: ${fileName}`)
    return []
  }

  const content = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)
  const records: BroadbandPlanRecord[] = []

  for (const row of rows) {
    const record = parseWOWRow(row, fileName)
    if (record) {
      records.push(record)
    }
  }

  // Count fiber vs cable
  const fiberCount = records.filter(r => r.connection_type === 'Fiber').length
  const cableCount = records.filter(r => r.connection_type === 'Cable').length

  console.log(`  ✅ Parsed ${records.length} plans from ${fileName}`)
  console.log(`     - ${fiberCount} fiber plans`)
  console.log(`     - ${cableCount} cable plans`)
  return records
}

// Parse Starlink CSV row (CamelCase columns)
function parseStarlinkRow(row: Record<string, string>, sourceFile: string): BroadbandPlanRecord | null {
  const fccPlanId = row.UniquePlanID?.trim()
  if (!fccPlanId) return null

  // Parse price - may be "120" or "150; 100; 500" (for multiple data tiers)
  const priceStr = row.MonthlyPrice?.split(';')[0]?.trim() || '0'
  const price = parseFloat(priceStr) || 0
  if (price === 0) return null

  // Parse speeds - may be "50-150" or "50-220"
  const downloadStr = row['TypicalDownloadSpeed '] || row.TypicalDownloadSpeed || ''
  const uploadStr = row['TypicalUploadSpeed '] || row.TypicalUploadSpeed || ''
  const downloadSpeed = parseSpeed(downloadStr)
  const uploadSpeed = parseSpeed(uploadStr)

  // Parse latency - may be "25-50; 60-90" (Continental US; Outside)
  const latencyStr = row['TypicalLatency '] || row.TypicalLatency || ''
  const latency = parseLatency(latencyStr.split(';')[0])

  // Determine service type based on plan name
  const planName = row.ServicePlanName || ''
  const isRoam = planName.toLowerCase().includes('roam')
  const isMobile = planName.toLowerCase().includes('mobile') ||
                   planName.toLowerCase().includes('global') ||
                   planName.toLowerCase().includes('priority')

  return {
    fcc_plan_id: fccPlanId,
    provider_name: 'Starlink',
    provider_id: null,
    service_plan_name: planName || 'Internet',
    tier_plan_name: row.TierPlanName || null,
    connection_type: 'Satellite',
    service_type: isRoam || isMobile ? 'mobile' : 'residential',
    monthly_price: price,
    has_intro_rate: row.IntroRate?.toLowerCase() === 'yes',
    intro_rate_price: row.IntroRatePrice ? parseFloat(row.IntroRatePrice) : null,
    intro_rate_months: row.IntroRateTime ? parseInt(row.IntroRateTime) : null,
    contract_required: row.ContractReq?.toLowerCase() === 'yes',
    contract_months: row.ContractTime ? parseInt(row.ContractTime) : null,
    contract_terms_url: row.ContractTermsURL?.trim() || null,
    early_termination_fee: parseFloat(row.EarlyTerminationFee) || 0,
    one_time_fees: parseFees(row.SinglePurchaseFeeDescription, row.SinglePurchaseFees),
    monthly_fees: [],
    tax_info: row.Tax || null,
    typical_download_speed: downloadSpeed,
    typical_upload_speed: uploadSpeed,
    typical_latency: latency,
    monthly_data_gb: row.MonthlyDataAllow?.toLowerCase() === 'unlimited' ? null :
                     parseInt(row.MonthlyDataAllow) || null,
    overage_price_per_gb: null,
    overage_increment_gb: null,
    bundle_discounts_url: row.BundleDiscountsURL || null,
    data_allowance_policy_url: row['DataAllowancePolicyUrl  '] || row.DataAllowancePolicyUrl || null,
    network_management_url: row.NetworkManagementPolicyURL || null,
    privacy_policy_url: row.PrivacyPolicyURL || null,
    support_phone: row['CustomerSupportPhone '] || row.CustomerSupportPhone || null,
    support_url: row.CustomerSupportWeb?.trim() || null,
    data_source: 'fcc_broadband_labels',
    source_file: sourceFile,
    is_active: true
  }
}

async function importStarlinkCSVs(dirPath: string): Promise<BroadbandPlanRecord[]> {
  if (!existsSync(dirPath)) {
    console.log(`  ⚠️ Directory not found: ${dirPath}`)
    return []
  }

  const records: BroadbandPlanRecord[] = []
  const files = ['Res_Plan_Label.csv', 'Res_Lite_Plan_Label.csv', 'Roam_Plan_Label_.csv',
                 'Global_Priority_Label_.csv', 'Local_Priority_Plan_Label_.csv']

  for (const file of files) {
    const filePath = resolve(dirPath, file)
    if (!existsSync(filePath)) {
      console.log(`    ⚠️ Skipping ${file} (not found)`)
      continue
    }

    const content = readFileSync(filePath, 'utf-8')
    const rows = parseCSV(content)

    for (const row of rows) {
      const record = parseStarlinkRow(row, file)
      if (record) {
        records.push(record)
      }
    }
    console.log(`    📄 Processed ${file}`)
  }

  const residentialCount = records.filter(r => r.service_type === 'residential').length
  const mobileCount = records.filter(r => r.service_type === 'mobile').length

  console.log(`  ✅ Parsed ${records.length} Starlink plans total`)
  console.log(`     - ${residentialCount} residential plans`)
  console.log(`     - ${mobileCount} mobile/roam plans`)
  return records
}

// Parse Viasat JSON from pidiMax column
function parseViasatRow(row: Record<string, string>, sourceFile: string): BroadbandPlanRecord | null {
  const fccPlanId = row.upi
  if (!fccPlanId) return null

  // Parse the nested JSON in pidiMax
  // The CSV has double-escaped quotes ("") that need to be converted to single (\")
  let pidiMax: any
  try {
    // Replace "" with \" for proper JSON parsing
    const jsonStr = row.pidiMax?.replace(/""/g, '\\"') || '{}'
    pidiMax = JSON.parse(jsonStr)
  } catch (e) {
    // Try another approach - the CSV parser may have already unescaped some quotes
    try {
      pidiMax = JSON.parse(row.pidiMax || '{}')
    } catch {
      // console.log(`    ⚠️ Failed to parse JSON for ${fccPlanId}`)
      return null
    }
  }

  // Extract plan details
  const planName = row.planName || pidiMax.fixedSatelliteInternetProduct?.description || 'Internet'

  // Get price from derivedIntroPrice
  const priceData = pidiMax.derivedIntroPrice?.prices?.[0]?.amount
  const price = priceData ? parseFloat(priceData.value) : 0
  if (price === 0) return null

  // Extract speeds from typicalSpeedCharacteristics
  let downloadSpeed: number | null = null
  let uploadSpeed: number | null = null
  let latency: number | null = null

  const speedChars = pidiMax.typicalSpeedCharacteristics || []
  for (const char of speedChars) {
    if (char.name === 'DOWNLOAD_SPEED_TYPICAL') {
      downloadSpeed = parseInt(char.value) || null
    } else if (char.name === 'UPLOAD_SPEED_TYPICAL') {
      uploadSpeed = parseInt(char.value) || null
    } else if (char.name === 'LATENCY_TTFB_TYPICAL') {
      latency = parseInt(char.value) || null
    }
  }

  // Get data cap from UI behaviors
  let dataCapGb: number | null = null
  const uiBehaviors = pidiMax.fixedSatelliteInternetProduct?.marketingCopy?.uiBehaviors?.characteristics || []
  for (const char of uiBehaviors) {
    if (char.name === 'DATA_CAP') {
      if (char.value === 'Unlimited') {
        dataCapGb = null
      } else {
        dataCapGb = parseInt(char.value) || null
      }
    }
  }

  // Get equipment lease fee
  const leaseFee = pidiMax.leaseFeeProducts?.[0]?.prices?.[0]?.amount?.value
  const monthlyFees: object[] = leaseFee ? [{ name: 'Equipment Lease', amount: parseFloat(leaseFee) }] : []

  // Get early termination fee
  const etfData = pidiMax.serviceContractProducts?.[0]?.broadbandNutritionLabelETF?.amount
  const etf = etfData ? parseFloat(etfData.value) : 0

  // Determine if it's business or residential
  const productFamily = pidiMax.productFamily || ''
  const isBusiness = productFamily.toLowerCase().includes('business')

  return {
    fcc_plan_id: fccPlanId,
    provider_name: 'Viasat',
    provider_id: null,
    service_plan_name: planName,
    tier_plan_name: productFamily || null,
    connection_type: 'Satellite',
    service_type: isBusiness ? 'business' : 'residential',
    monthly_price: price,
    has_intro_rate: false,
    intro_rate_price: null,
    intro_rate_months: null,
    contract_required: etf > 0,
    contract_months: etf > 0 ? 24 : null,
    contract_terms_url: null,
    early_termination_fee: etf,
    one_time_fees: [],
    monthly_fees: monthlyFees,
    tax_info: null,
    typical_download_speed: downloadSpeed,
    typical_upload_speed: uploadSpeed,
    typical_latency: latency,
    monthly_data_gb: dataCapGb,
    overage_price_per_gb: null,
    overage_increment_gb: null,
    bundle_discounts_url: null,
    data_allowance_policy_url: 'https://www.viasat.com/legal',
    network_management_url: 'https://www.viasat.com/legal',
    privacy_policy_url: 'https://www.viasat.com/legal',
    support_phone: '1-855-463-9333',
    support_url: 'https://www.viasat.com/support',
    data_source: 'fcc_broadband_labels',
    source_file: sourceFile,
    is_active: row.isActive === '1'
  }
}

async function importViasatCSV(csvPath: string, fileName: string): Promise<BroadbandPlanRecord[]> {
  if (!existsSync(csvPath)) {
    console.log(`  ⚠️ File not found: ${fileName}`)
    return []
  }

  const content = readFileSync(csvPath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())
  const records: BroadbandPlanRecord[] = []

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]

    // Viasat CSV format: hashCode,upi,pidiMax,productTypeId,planName,createdDate,isActive
    // The pidiMax field contains JSON wrapped in quotes with "" escaping

    // Find the JSON by looking for the pattern between the second and third commas
    const firstComma = line.indexOf(',')
    const secondComma = line.indexOf(',', firstComma + 1)

    // Find the start of JSON (after upi,)
    const jsonStart = secondComma + 1

    // The JSON is quoted, so it starts with "{ and ends with }",
    // We need to find the matching end by counting braces
    let jsonEnd = -1
    let braceCount = 0
    let inQuotes = false
    let foundJsonStart = false

    for (let j = jsonStart; j < line.length; j++) {
      const char = line[j]

      if (char === '"' && !foundJsonStart) {
        foundJsonStart = true
        continue
      }

      if (foundJsonStart) {
        if (char === '{') braceCount++
        if (char === '}') braceCount--

        if (braceCount === 0 && char === '}') {
          jsonEnd = j + 1
          break
        }
      }
    }

    if (jsonEnd === -1) continue

    // Extract fields
    const upi = line.substring(firstComma + 1, secondComma)
    const jsonRaw = line.substring(jsonStart, jsonEnd + 1)

    // Clean up the JSON - remove outer quotes and unescape ""
    let jsonStr = jsonRaw
    if (jsonStr.startsWith('"')) jsonStr = jsonStr.substring(1)
    if (jsonStr.endsWith('"')) jsonStr = jsonStr.substring(0, jsonStr.length - 1)
    jsonStr = jsonStr.replace(/""/g, '"')

    // Parse remaining fields after JSON
    const afterJson = line.substring(jsonEnd + 2) // Skip the closing ","
    const remainingFields = afterJson.split(',')
    const productTypeId = remainingFields[0] || ''
    const planName = remainingFields[1] || ''
    const isActive = remainingFields[3]?.trim() === '1'

    // Parse JSON
    let pidiMax: any
    try {
      pidiMax = JSON.parse(jsonStr)
    } catch {
      continue
    }

    // Get price from derivedIntroPrice
    const priceData = pidiMax.derivedIntroPrice?.prices?.[0]?.amount
    const price = priceData ? parseFloat(priceData.value) : 0
    if (price === 0) continue

    // Extract speeds from typicalSpeedCharacteristics
    let downloadSpeed: number | null = null
    let uploadSpeed: number | null = null
    let latency: number | null = null

    const speedChars = pidiMax.typicalSpeedCharacteristics || []
    for (const char of speedChars) {
      if (char.name === 'DOWNLOAD_SPEED_TYPICAL') {
        downloadSpeed = parseInt(char.value) || null
      } else if (char.name === 'UPLOAD_SPEED_TYPICAL') {
        uploadSpeed = parseInt(char.value) || null
      } else if (char.name === 'LATENCY_TTFB_TYPICAL') {
        latency = parseInt(char.value) || null
      }
    }

    // Get data cap
    let dataCapGb: number | null = null
    const uiBehaviors = pidiMax.fixedSatelliteInternetProduct?.marketingCopy?.uiBehaviors?.characteristics || []
    for (const char of uiBehaviors) {
      if (char.name === 'DATA_CAP') {
        if (char.value === 'Unlimited') {
          dataCapGb = null
        } else {
          dataCapGb = parseInt(char.value) || null
        }
      }
    }

    // Get equipment lease fee
    const leaseFee = pidiMax.leaseFeeProducts?.[0]?.prices?.[0]?.amount?.value
    const monthlyFees: object[] = leaseFee ? [{ name: 'Equipment Lease', amount: parseFloat(leaseFee) }] : []

    // Get early termination fee
    const etfData = pidiMax.serviceContractProducts?.[0]?.broadbandNutritionLabelETF?.amount
    const etf = etfData ? parseFloat(etfData.value) : 0

    const productFamily = pidiMax.productFamily || ''
    const isBusiness = productFamily.toLowerCase().includes('business')

    records.push({
      fcc_plan_id: upi,
      provider_name: 'Viasat',
      provider_id: null,
      service_plan_name: planName || pidiMax.fixedSatelliteInternetProduct?.description || 'Internet',
      tier_plan_name: productFamily || null,
      connection_type: 'Satellite',
      service_type: isBusiness ? 'business' : 'residential',
      monthly_price: price,
      has_intro_rate: false,
      intro_rate_price: null,
      intro_rate_months: null,
      contract_required: etf > 0,
      contract_months: etf > 0 ? 24 : null,
      contract_terms_url: null,
      early_termination_fee: etf,
      one_time_fees: [],
      monthly_fees: monthlyFees,
      tax_info: null,
      typical_download_speed: downloadSpeed,
      typical_upload_speed: uploadSpeed,
      typical_latency: latency,
      monthly_data_gb: dataCapGb,
      overage_price_per_gb: null,
      overage_increment_gb: null,
      bundle_discounts_url: null,
      data_allowance_policy_url: 'https://www.viasat.com/legal',
      network_management_url: 'https://www.viasat.com/legal',
      privacy_policy_url: 'https://www.viasat.com/legal',
      support_phone: '1-855-463-9333',
      support_url: 'https://www.viasat.com/support',
      data_source: 'fcc_broadband_labels',
      source_file: fileName,
      is_active: isActive
    })
  }

  const businessCount = records.filter(r => r.service_type === 'business').length
  const residentialCount = records.filter(r => r.service_type === 'residential').length

  console.log(`  ✅ Parsed ${records.length} plans from ${fileName}`)
  console.log(`     - ${residentialCount} residential plans`)
  console.log(`     - ${businessCount} business plans`)
  return records
}

// Google Fiber - hardcoded from DOCX extraction (6 unique plans)
function getGoogleFiberPlans(): BroadbandPlanRecord[] {
  const plans: BroadbandPlanRecord[] = [
    {
      fcc_plan_id: 'F0021105283A09CCE1FF000B2B',
      provider_name: 'Google Fiber',
      provider_id: null,
      service_plan_name: 'Core 1 Gig',
      tier_plan_name: '1 Gig',
      connection_type: 'Fiber',
      service_type: 'residential',
      monthly_price: 70,
      has_intro_rate: false,
      intro_rate_price: null,
      intro_rate_months: null,
      contract_required: false,
      contract_months: null,
      contract_terms_url: null,
      early_termination_fee: 0,
      one_time_fees: [],
      monthly_fees: [{ name: 'Local Access Fee', amount: 2.10 }],
      tax_info: 'Varies by location',
      typical_download_speed: 1140,
      typical_upload_speed: 1137,
      typical_latency: 13,
      monthly_data_gb: null,
      overage_price_per_gb: null,
      overage_increment_gb: null,
      bundle_discounts_url: null,
      data_allowance_policy_url: null,
      network_management_url: 'https://fiber.google.com/legal',
      privacy_policy_url: 'https://fiber.google.com/legal',
      support_phone: '(866) 777-7550',
      support_url: 'https://fiber.google.com/support',
      data_source: 'fcc_broadband_labels',
      source_file: 'google_fiber_docx',
      is_active: true
    },
    {
      fcc_plan_id: 'F0021105283EA281D6CBC2900B',
      provider_name: 'Google Fiber',
      provider_id: null,
      service_plan_name: 'Home 3 Gig',
      tier_plan_name: '3 Gig',
      connection_type: 'Fiber',
      service_type: 'residential',
      monthly_price: 100,
      has_intro_rate: false,
      intro_rate_price: null,
      intro_rate_months: null,
      contract_required: false,
      contract_months: null,
      contract_terms_url: null,
      early_termination_fee: 0,
      one_time_fees: [],
      monthly_fees: [{ name: 'Local Access Fee', amount: 3.00 }],
      tax_info: 'Varies by location',
      typical_download_speed: 3423,
      typical_upload_speed: 3418,
      typical_latency: 13,
      monthly_data_gb: null,
      overage_price_per_gb: null,
      overage_increment_gb: null,
      bundle_discounts_url: null,
      data_allowance_policy_url: null,
      network_management_url: 'https://fiber.google.com/legal',
      privacy_policy_url: 'https://fiber.google.com/legal',
      support_phone: '(866) 777-7550',
      support_url: 'https://fiber.google.com/support',
      data_source: 'fcc_broadband_labels',
      source_file: 'google_fiber_docx',
      is_active: true
    },
    {
      fcc_plan_id: 'F0021105283EEE223BC1B78F72',
      provider_name: 'Google Fiber',
      provider_id: null,
      service_plan_name: '2 Gig',
      tier_plan_name: '2 Gig',
      connection_type: 'Fiber',
      service_type: 'residential',
      monthly_price: 100,
      has_intro_rate: false,
      intro_rate_price: null,
      intro_rate_months: null,
      contract_required: false,
      contract_months: null,
      contract_terms_url: null,
      early_termination_fee: 0,
      one_time_fees: [],
      monthly_fees: [{ name: 'Local Access Fee', amount: 3.00 }],
      tax_info: 'Varies by location',
      typical_download_speed: 2250,
      typical_upload_speed: 1137,
      typical_latency: 13,
      monthly_data_gb: null,
      overage_price_per_gb: null,
      overage_increment_gb: null,
      bundle_discounts_url: null,
      data_allowance_policy_url: null,
      network_management_url: 'https://fiber.google.com/legal',
      privacy_policy_url: 'https://fiber.google.com/legal',
      support_phone: '(866) 777-7550',
      support_url: 'https://fiber.google.com/support',
      data_source: 'fcc_broadband_labels',
      source_file: 'google_fiber_docx',
      is_active: true
    },
    {
      fcc_plan_id: 'F0021105283D3E1585E95E4535',
      provider_name: 'Google Fiber',
      provider_id: null,
      service_plan_name: '5 Gig',
      tier_plan_name: '5 Gig',
      connection_type: 'Fiber',
      service_type: 'residential',
      monthly_price: 125,
      has_intro_rate: false,
      intro_rate_price: null,
      intro_rate_months: null,
      contract_required: false,
      contract_months: null,
      contract_terms_url: null,
      early_termination_fee: 0,
      one_time_fees: [],
      monthly_fees: [{ name: 'Local Access Fee', amount: 3.75 }],
      tax_info: 'Varies by location',
      typical_download_speed: 5709,
      typical_upload_speed: 5797,
      typical_latency: 13,
      monthly_data_gb: null,
      overage_price_per_gb: null,
      overage_increment_gb: null,
      bundle_discounts_url: null,
      data_allowance_policy_url: null,
      network_management_url: 'https://fiber.google.com/legal',
      privacy_policy_url: 'https://fiber.google.com/legal',
      support_phone: '(866) 777-7550',
      support_url: 'https://fiber.google.com/support',
      data_source: 'fcc_broadband_labels',
      source_file: 'google_fiber_docx',
      is_active: true
    },
    {
      fcc_plan_id: 'F00211052834F44A1BCF62292E',
      provider_name: 'Google Fiber',
      provider_id: null,
      service_plan_name: '8 Gig',
      tier_plan_name: '8 Gig',
      connection_type: 'Fiber',
      service_type: 'residential',
      monthly_price: 150,
      has_intro_rate: false,
      intro_rate_price: null,
      intro_rate_months: null,
      contract_required: false,
      contract_months: null,
      contract_terms_url: null,
      early_termination_fee: 0,
      one_time_fees: [],
      monthly_fees: [{ name: 'Local Access Fee', amount: 4.50 }],
      tax_info: 'Varies by location',
      typical_download_speed: 8086,
      typical_upload_speed: 8119,
      typical_latency: 13,
      monthly_data_gb: null,
      overage_price_per_gb: null,
      overage_increment_gb: null,
      bundle_discounts_url: null,
      data_allowance_policy_url: null,
      network_management_url: 'https://fiber.google.com/legal',
      privacy_policy_url: 'https://fiber.google.com/legal',
      support_phone: '(866) 777-7550',
      support_url: 'https://fiber.google.com/support',
      data_source: 'fcc_broadband_labels',
      source_file: 'google_fiber_docx',
      is_active: true
    },
    {
      fcc_plan_id: 'F002110528369FEECDBD160BB7',
      provider_name: 'Google Fiber',
      provider_id: null,
      service_plan_name: 'Edge 8 Gig',
      tier_plan_name: '8 Gig',
      connection_type: 'Fiber',
      service_type: 'residential',
      monthly_price: 150,
      has_intro_rate: false,
      intro_rate_price: null,
      intro_rate_months: null,
      contract_required: false,
      contract_months: null,
      contract_terms_url: null,
      early_termination_fee: 0,
      one_time_fees: [],
      monthly_fees: [{ name: 'Local Access Fee', amount: 4.50 }],
      tax_info: 'Varies by location',
      typical_download_speed: 8086,
      typical_upload_speed: 8119,
      typical_latency: 13,
      monthly_data_gb: null,
      overage_price_per_gb: null,
      overage_increment_gb: null,
      bundle_discounts_url: null,
      data_allowance_policy_url: null,
      network_management_url: 'https://fiber.google.com/legal',
      privacy_policy_url: 'https://fiber.google.com/legal',
      support_phone: '(866) 777-7550',
      support_url: 'https://fiber.google.com/support',
      data_source: 'fcc_broadband_labels',
      source_file: 'google_fiber_docx',
      is_active: true
    }
  ]

  console.log(`  ✅ Added ${plans.length} Google Fiber plans (from DOCX extraction)`)
  return plans
}

// Parse Xfinity CSV (FCC format with different column names)
function parseXfinityRow(row: Record<string, string>, sourceFile: string): BroadbandPlanRecord | null {
  const fccPlanId = row.unique_plan_identifier?.trim()
  if (!fccPlanId) return null

  // Parse price
  const price = parseFloat(row.price_recurring) || 0
  if (price === 0) return null

  // Parse speeds - typical low/high, use the low value
  const downloadSpeed = parseFloat(row.bandwidth_download_typical_low) || null
  const uploadSpeed = parseFloat(row.bandwidth_upload_typical_low) || null
  const latency = parseFloat(row.latency_idle_low) || null

  // Determine connection type from network_technology_type
  // 40 = DOCSIS (Cable), 50 = Fiber, etc.
  const techType = row.network_technology_type
  let connectionType = 'Cable'
  if (techType === '50' || row.service_plan_name?.toLowerCase().includes('fiber')) {
    connectionType = 'Fiber'
  }

  // Parse intro rate
  const introPrice = parseFloat(row.fee_introductory) || null
  const hasIntroRate = introPrice !== null && introPrice > 0

  // Parse contract
  const contractRequired = row.contract_required?.toLowerCase() === 'yes'

  // Parse one-time fees
  const oneTimeFees: object[] = []
  if (row.fee_one_time_amount && row.fee_one_time_details) {
    const amounts = row.fee_one_time_amount.split(';')
    const details = row.fee_one_time_details.split(';')
    for (let i = 0; i < amounts.length && i < details.length; i++) {
      const amt = parseFloat(amounts[i])
      if (amt > 0) {
        oneTimeFees.push({ name: details[i].trim(), amount: amt })
      }
    }
  }

  // Parse monthly fees
  const monthlyFees: object[] = []
  if (row.fee_recurring && row.fee_recurring_description) {
    const amounts = row.fee_recurring.split(';')
    const details = row.fee_recurring_description.split(';')
    for (let i = 0; i < amounts.length && i < details.length; i++) {
      const amt = parseFloat(amounts[i])
      if (amt > 0) {
        monthlyFees.push({ name: details[i].trim(), amount: amt })
      }
    }
  }

  return {
    fcc_plan_id: fccPlanId,
    provider_name: 'Xfinity',
    provider_id: null,
    service_plan_name: row.service_plan_name || 'Internet',
    tier_plan_name: null,
    connection_type: connectionType,
    service_type: 'residential',
    monthly_price: price,
    has_intro_rate: hasIntroRate,
    intro_rate_price: introPrice,
    intro_rate_months: null,
    contract_required: contractRequired,
    contract_months: null,
    contract_terms_url: row.contract_terms_uri || null,
    early_termination_fee: parseFloat(row.fee_early_termination) || 0,
    one_time_fees: oneTimeFees,
    monthly_fees: monthlyFees,
    tax_info: row.government_taxes || null,
    typical_download_speed: downloadSpeed,
    typical_upload_speed: uploadSpeed,
    typical_latency: latency,
    monthly_data_gb: null,
    overage_price_per_gb: null,
    overage_increment_gb: null,
    bundle_discounts_url: null,
    data_allowance_policy_url: row.uri_data_usage || null,
    network_management_url: row.uri_policy_network_management || null,
    privacy_policy_url: row.uri_policy_privacy || null,
    support_phone: row.customer_support_phone || null,
    support_url: row.uri_customer_support || null,
    data_source: 'fcc_broadband_labels',
    source_file: sourceFile,
    is_active: true
  }
}

async function importXfinityCSV(csvPath: string, fileName: string): Promise<BroadbandPlanRecord[]> {
  if (!existsSync(csvPath)) {
    console.log(`  ⚠️ File not found: ${fileName}`)
    return []
  }

  const content = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)
  const records: BroadbandPlanRecord[] = []
  const seenPlans = new Set<string>()

  for (const row of rows) {
    const record = parseXfinityRow(row, fileName)
    if (record) {
      // Deduplicate by plan ID + plan name combination
      const key = `${record.fcc_plan_id}-${record.service_plan_name}`
      if (!seenPlans.has(key)) {
        seenPlans.add(key)
        records.push(record)
      }
    }
  }

  // Count by connection type
  const fiberCount = records.filter(r => r.connection_type === 'Fiber').length
  const cableCount = records.filter(r => r.connection_type === 'Cable').length

  console.log(`  ✅ Parsed ${records.length} unique plans from ${fileName}`)
  console.log(`     - ${fiberCount} fiber plans`)
  console.log(`     - ${cableCount} cable plans`)
  return records
}

// Parse Metronet CSV
function parseMetronetRow(row: Record<string, string>, sourceFile: string): BroadbandPlanRecord | null {
  const fccPlanId = row.unique_plan_id?.trim()
  if (!fccPlanId) return null

  // Parse price
  const price = parseFloat(row.monthly_price) || 0
  if (price === 0) return null

  // Parse speeds - they include units like "108.47 Mbps"
  const parseMetronetSpeed = (speedStr: string): number | null => {
    if (!speedStr || speedStr === 'NULL') return null
    const match = speedStr.match(/([0-9.]+)\s*(Mbps|Gbps)/i)
    if (!match) return null
    let speed = parseFloat(match[1])
    if (match[2].toLowerCase() === 'gbps') speed *= 1000
    return Math.round(speed)
  }

  const downloadSpeed = parseMetronetSpeed(row.typical_download_speed)
  const uploadSpeed = parseMetronetSpeed(row.typical_upload_speed)

  // Parse latency - "13 Milliseconds"
  let latency: number | null = null
  if (row.typical_latency && row.typical_latency !== 'NULL') {
    const latMatch = row.typical_latency.match(/([0-9]+)/)
    if (latMatch) latency = parseInt(latMatch[1])
  }

  // Determine if business or residential
  const isBusiness = row.service_plan_name?.toLowerCase().includes('business')

  // Parse intro rate
  const hasIntroRate = row.intro_rate?.toLowerCase() === 'yes'
  const introPrice = row.intro_rate_price !== 'NULL' ? parseFloat(row.intro_rate_price) : null

  // Parse contract
  const contractRequired = row.contract_req?.toLowerCase() === 'yes'
  const contractMonths = row.contract_time !== 'NULL' ? parseInt(row.contract_time) : null

  // Parse monthly fees
  const monthlyFees: object[] = []
  if (row.monthly_provider_fee && row.monthly_provider_fee !== 'NULL' && row['monthly_provider_fee _descr']) {
    const amt = parseFloat(row.monthly_provider_fee)
    if (amt > 0) {
      monthlyFees.push({ name: row['monthly_provider_fee _descr'].replace(/[()]/g, ''), amount: amt })
    }
  }

  return {
    fcc_plan_id: fccPlanId,
    provider_name: 'Metronet',
    provider_id: null,
    service_plan_name: row.service_plan_name || 'Internet',
    tier_plan_name: null,
    connection_type: 'Fiber',
    service_type: isBusiness ? 'business' : 'residential',
    monthly_price: price,
    has_intro_rate: hasIntroRate,
    intro_rate_price: introPrice,
    intro_rate_months: null,
    contract_required: contractRequired,
    contract_months: contractMonths,
    contract_terms_url: row.contract_terms_url || null,
    early_termination_fee: 0,
    one_time_fees: [],
    monthly_fees: monthlyFees,
    tax_info: row.tax || null,
    typical_download_speed: downloadSpeed,
    typical_upload_speed: uploadSpeed,
    typical_latency: latency,
    monthly_data_gb: null,
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

async function importMetronetCSV(csvPath: string, fileName: string): Promise<BroadbandPlanRecord[]> {
  if (!existsSync(csvPath)) {
    console.log(`  ⚠️ File not found: ${fileName}`)
    return []
  }

  const content = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)
  const records: BroadbandPlanRecord[] = []

  for (const row of rows) {
    const record = parseMetronetRow(row, fileName)
    if (record) {
      records.push(record)
    }
  }

  const businessCount = records.filter(r => r.service_type === 'business').length
  const residentialCount = records.filter(r => r.service_type === 'residential').length

  console.log(`  ✅ Parsed ${records.length} plans from ${fileName}`)
  console.log(`     - ${residentialCount} residential plans`)
  console.log(`     - ${businessCount} business plans`)
  return records
}

// ============================================
// Cox - Import from OCR-extracted JSON
// ============================================

interface CoxExtractedPlan {
  filename: string
  provider_name: string
  plan_name: string | null
  monthly_price: number | null
  download_speed: number | null
  upload_speed: number | null
  latency: number | null
  data_cap_gb: number | null
  connection_type: string
  service_type: string
}

function importCoxJSON(jsonPath: string): BroadbandPlanRecord[] {
  if (!existsSync(jsonPath)) {
    console.log(`  ⚠️ Cox JSON not found: ${jsonPath}`)
    return []
  }

  const content = readFileSync(jsonPath, 'utf-8')
  const plans: CoxExtractedPlan[] = JSON.parse(content)
  const records: BroadbandPlanRecord[] = []

  for (const plan of plans) {
    // Skip invalid plans
    if (!plan.monthly_price || !plan.download_speed || !plan.plan_name) {
      continue
    }

    // Generate unique FCC plan ID from filename
    const fccPlanId = `COX-OCR-${plan.filename.replace('.png', '').replace(/[^a-zA-Z0-9]/g, '-')}`

    // Clean up plan name - remove location prefix for cleaner display
    let planName = plan.plan_name
    // Extract core plan name (e.g., "Go Super Fast Internet" from "Tucson AZ Go Super Fast Internet")
    const planMatch = planName.match(/(ConnectAssist|Go\s+(?:Fast|Faster|Even Faster|Super Fast|Beyond Fast|BeyondFast)|Fiber.*)/i)
    const corePlanName = planMatch ? planMatch[1] : planName

    const record: BroadbandPlanRecord = {
      fcc_plan_id: fccPlanId,
      provider_name: 'Cox',
      provider_id: null,
      service_plan_name: corePlanName,
      tier_plan_name: planName, // Full name with location
      connection_type: plan.connection_type,
      service_type: plan.service_type || 'residential',
      monthly_price: plan.monthly_price,
      has_intro_rate: false,
      intro_rate_price: null,
      intro_rate_months: null,
      contract_required: false,
      contract_months: null,
      contract_terms_url: null,
      early_termination_fee: 0,
      one_time_fees: [],
      monthly_fees: [{ name: 'Panoramic WiFi', amount: 15 }],
      tax_info: 'Varies by location',
      typical_download_speed: plan.download_speed,
      typical_upload_speed: plan.upload_speed,
      typical_latency: plan.latency,
      monthly_data_gb: plan.data_cap_gb,
      overage_price_per_gb: plan.data_cap_gb ? 10 : null, // Cox charges $10/50GB overage
      overage_increment_gb: plan.data_cap_gb ? 50 : null,
      bundle_discounts_url: null,
      data_allowance_policy_url: 'https://www.cox.com/residential/support/data-usage-policy.html',
      network_management_url: 'https://www.cox.com/aboutus/policies/network-management.html',
      privacy_policy_url: 'https://www.cox.com/aboutus/policies/privacy-policy.html',
      support_phone: '1-800-234-3993',
      support_url: 'https://www.cox.com/residential/support.html',
      data_source: 'ocr_extraction',
      source_file: plan.filename,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    records.push(record)
  }

  const cableCount = records.filter(r => r.connection_type === 'Cable').length
  const fiberCount = records.filter(r => r.connection_type === 'Fiber').length

  console.log(`  ✅ Parsed ${records.length} Cox plans from OCR extraction`)
  console.log(`     - ${cableCount} cable plans`)
  console.log(`     - ${fiberCount} fiber plans`)
  return records
}

// ============================================
// Verizon Fios - Import from manually extracted JSON
// ============================================

function importVerizonJSON(jsonPath: string): BroadbandPlanRecord[] {
  if (!existsSync(jsonPath)) {
    console.log(`  ⚠️ Verizon JSON not found: ${jsonPath}`)
    return []
  }

  const content = readFileSync(jsonPath, 'utf-8')
  const plans: CoxExtractedPlan[] = JSON.parse(content) // Same structure as Cox
  const records: BroadbandPlanRecord[] = []

  for (const plan of plans) {
    if (!plan.monthly_price || !plan.download_speed || !plan.plan_name) {
      continue
    }

    const fccPlanId = `VERIZON-${plan.filename.replace('.png', '').replace(/[^a-zA-Z0-9]/g, '-')}`

    const record: BroadbandPlanRecord = {
      fcc_plan_id: fccPlanId,
      provider_name: 'Verizon Fios',
      provider_id: null,
      service_plan_name: plan.plan_name,
      tier_plan_name: null,
      connection_type: 'Fiber',
      service_type: 'residential',
      monthly_price: plan.monthly_price,
      has_intro_rate: false,
      intro_rate_price: null,
      intro_rate_months: null,
      contract_required: false,
      contract_months: null,
      contract_terms_url: null,
      early_termination_fee: 0,
      one_time_fees: [{ name: 'Professional Installation', amount: 99 }],
      monthly_fees: [],
      tax_info: 'Included',
      typical_download_speed: plan.download_speed,
      typical_upload_speed: plan.upload_speed,
      typical_latency: plan.latency ? Math.round(plan.latency) : null,
      monthly_data_gb: null, // Unlimited
      overage_price_per_gb: null,
      overage_increment_gb: null,
      bundle_discounts_url: 'https://www.verizon.com/home/bundles/',
      data_allowance_policy_url: null,
      network_management_url: 'https://www.verizon.com/about/our-company/open-internet',
      privacy_policy_url: 'https://www.verizon.com/about/privacy/',
      support_phone: '800-837-4966',
      support_url: 'https://www.verizon.com/support/contact-us/',
      data_source: 'manual_extraction',
      source_file: plan.filename,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    records.push(record)
  }

  console.log(`  ✅ Parsed ${records.length} Verizon Fios plans`)
  return records
}

// ============================================
// CenturyLink - Import from OCR-extracted JSON
// ============================================

interface CenturyLinkExtractedPlan {
  filename: string
  provider_name: string
  plan_name: string | null
  monthly_price: number | null
  download_speed: number | null
  upload_speed: number | null
  latency: number | null
  data_cap_gb: number | null
  connection_type: string
  service_type: string
  location?: string
}

function importCenturyLinkJSON(jsonPath: string): BroadbandPlanRecord[] {
  if (!existsSync(jsonPath)) {
    console.log(`  ⚠️ CenturyLink JSON not found: ${jsonPath}`)
    return []
  }

  const content = readFileSync(jsonPath, 'utf-8')
  const plans: CenturyLinkExtractedPlan[] = JSON.parse(content)
  const records: BroadbandPlanRecord[] = []

  for (const plan of plans) {
    // Skip invalid plans - need price AND download speed
    if (!plan.monthly_price || !plan.download_speed || !plan.plan_name) {
      continue
    }

    // Skip obviously wrong prices (OCR errors like $7 instead of $75)
    if (plan.monthly_price < 20) {
      continue
    }

    const fccPlanId = `CENTURYLINK-${plan.filename.replace('.png', '').replace(/[^a-zA-Z0-9]/g, '-')}`

    const record: BroadbandPlanRecord = {
      fcc_plan_id: fccPlanId,
      provider_name: 'CenturyLink',
      provider_id: null,
      service_plan_name: plan.plan_name,
      tier_plan_name: plan.location ? `${plan.plan_name} (${plan.location})` : plan.plan_name,
      connection_type: plan.connection_type,
      service_type: 'residential',
      monthly_price: plan.monthly_price,
      has_intro_rate: false,
      intro_rate_price: null,
      intro_rate_months: null,
      contract_required: false,
      contract_months: null,
      contract_terms_url: null,
      early_termination_fee: 0,
      one_time_fees: [],
      monthly_fees: [],
      tax_info: 'Varies by location',
      typical_download_speed: plan.download_speed,
      typical_upload_speed: plan.upload_speed,
      typical_latency: plan.latency ? Math.round(plan.latency) : null,
      monthly_data_gb: null, // Unlimited
      overage_price_per_gb: null,
      overage_increment_gb: null,
      bundle_discounts_url: null,
      data_allowance_policy_url: null,
      network_management_url: 'https://www.centurylink.com/aboutus/legal/internet-service-management.html',
      privacy_policy_url: 'https://www.centurylink.com/aboutus/legal/privacy-policy.html',
      support_phone: '1-800-244-1111',
      support_url: 'https://www.centurylink.com/home/help.html',
      data_source: 'ocr_extraction',
      source_file: plan.filename,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    records.push(record)
  }

  const dslCount = records.filter(r => r.connection_type === 'DSL').length
  const fiberCount = records.filter(r => r.connection_type === 'Fiber').length

  console.log(`  ✅ Parsed ${records.length} CenturyLink plans from OCR extraction`)
  console.log(`     - ${dslCount} DSL plans`)
  console.log(`     - ${fiberCount} fiber plans`)
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
    'AT&T Internet': 'AT&T',
    'Starlink Internet Services Limited': 'Starlink',
    'WOW! fiber': 'WOW!',
    'GFiber': 'Google Fiber'
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

  // ========== NEW PROVIDERS ==========

  // Import WOW!
  console.log('\n📁 Processing WOW!...')
  const wow = await importWOWCSV(WOW_CSV, 'WOW Facts Lables.csv')
  allRecords.push(...wow)

  // Import Starlink
  console.log('\n📁 Processing Starlink...')
  const starlink = await importStarlinkCSVs(STARLINK_DIR)
  allRecords.push(...starlink)

  // Import Viasat
  console.log('\n📁 Processing Viasat...')
  const viasat = await importViasatCSV(VIASAT_CSV, 'Archived-BNL.csv')
  allRecords.push(...viasat)

  // Import Google Fiber
  console.log('\n📁 Processing Google Fiber...')
  const googleFiber = getGoogleFiberPlans()
  allRecords.push(...googleFiber)

  // Import Xfinity
  console.log('\n📁 Processing Xfinity...')
  const xfinity = await importXfinityCSV(XFINITY_CSV, 'xfinity_broadband_labels.csv')
  allRecords.push(...xfinity)

  // Import Metronet
  console.log('\n📁 Processing Metronet...')
  const metronet = await importMetronetCSV(METRONET_CSV, 'metronet_broadband_labels.csv')
  allRecords.push(...metronet)

  // Import Cox (from OCR-extracted images)
  console.log('\n📁 Processing Cox...')
  const cox = importCoxJSON(COX_JSON)
  allRecords.push(...cox)

  // Import Verizon Fios (from manually extracted images)
  console.log('\n📁 Processing Verizon Fios...')
  const verizon = importVerizonJSON(VERIZON_JSON)
  allRecords.push(...verizon)

  // Import CenturyLink (from OCR-extracted images)
  console.log('\n📁 Processing CenturyLink...')
  const centurylink = importCenturyLinkJSON(CENTURYLINK_JSON)
  allRecords.push(...centurylink)

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
