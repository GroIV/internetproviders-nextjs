/**
 * Backfill AT&T speed data from broadband facts CSV
 * The original import didn't parse the speed columns correctly
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Parse speed string like "397.9 Mbps" or "1 Gbps" or "12-78 Mbps (4G LTE)" to number
function parseSpeed(speedStr: string): number | null {
  if (!speedStr || speedStr.trim() === '') return null

  // Handle range format like "12-78 Mbps (4G LTE)" - take the max value
  const rangeMatch = speedStr.match(/(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\s*(Mbps|Gbps)/i)
  if (rangeMatch) {
    const maxValue = parseFloat(rangeMatch[2])
    const unit = rangeMatch[3].toLowerCase()
    return unit === 'gbps' ? maxValue * 1000 : maxValue
  }

  // Handle single value like "397.9 Mbps" or "1 Gbps"
  const singleMatch = speedStr.match(/(\d+(?:\.\d+)?)\s*(Mbps|Gbps)/i)
  if (singleMatch) {
    const value = parseFloat(singleMatch[1])
    const unit = singleMatch[2].toLowerCase()
    return unit === 'gbps' ? value * 1000 : value
  }

  return null
}

// Parse latency string like "12 ms" or "29-52 ms (4G LTE)" to number
function parseLatency(latencyStr: string): number | null {
  if (!latencyStr || latencyStr.trim() === '') return null

  // Handle range format - take the lower value (best case)
  const rangeMatch = latencyStr.match(/(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\s*(?:ms|milliseconds)/i)
  if (rangeMatch) {
    return parseFloat(rangeMatch[1])
  }

  // Handle single value
  const singleMatch = latencyStr.match(/(\d+(?:\.\d+)?)\s*(?:ms|milliseconds)?/i)
  if (singleMatch) {
    return parseFloat(singleMatch[1])
  }

  return null
}

// Parse price string like "65.00*" or "90.00" to number
function parsePrice(priceStr: string): number | null {
  if (!priceStr) return null
  const match = priceStr.match(/(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : null
}

// Parse CSV line (handling quoted fields with commas)
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)

  return result
}

async function main() {
  console.log('Reading AT&T broadband facts CSV...')

  const csvPath = '/Users/groiv/Python Sandbox/Internet Provders AI 1/BB Facts Lables/ATT Facts Lables/BBFMachineReadable.csv'
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n')

  // Parse header to get column indices
  const header = parseCSVLine(lines[0])
  const cols = {
    planName: header.indexOf('planName'),
    serviceType: header.indexOf('serviceType'),
    priceAmount: header.indexOf('priceAmount'),
    downloadSpeed: header.indexOf('speedsDownloadSpeed'),
    uploadSpeed: header.indexOf('speedsUploadSpeed'),
    latency: header.indexOf('speedsLatency'),
    dataMonthly: header.indexOf('dataMonthly'),
    contractStatus: header.indexOf('contractStatus'),
  }

  console.log('Column indices:', cols)

  // Process Fixed (residential) plans only
  const updates: Array<{
    planName: string
    price: number | null
    downloadSpeed: number | null
    uploadSpeed: number | null
    latency: number | null
    dataMonthly: string
    contractRequired: boolean
  }> = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const fields = parseCSVLine(lines[i])
    const serviceType = fields[cols.serviceType]

    // Only process Fixed (residential internet) plans
    if (serviceType !== 'Fixed') continue

    const planName = fields[cols.planName]
    const downloadSpeed = parseSpeed(fields[cols.downloadSpeed])

    // Skip plans with no parseable download speed
    if (!downloadSpeed) continue

    updates.push({
      planName,
      price: parsePrice(fields[cols.priceAmount]),
      downloadSpeed,
      uploadSpeed: parseSpeed(fields[cols.uploadSpeed]),
      latency: parseLatency(fields[cols.latency]),
      dataMonthly: fields[cols.dataMonthly],
      contractRequired: fields[cols.contractStatus]?.includes('requires a contract') || false,
    })
  }

  console.log(`Found ${updates.length} Fixed plans with speed data`)

  // Group by plan name to avoid duplicates (take first occurrence)
  const uniquePlans = new Map<string, typeof updates[0]>()
  for (const plan of updates) {
    if (!uniquePlans.has(plan.planName)) {
      uniquePlans.set(plan.planName, plan)
    }
  }

  console.log(`Unique plans: ${uniquePlans.size}`)

  // Update database
  let updated = 0
  let notFound = 0

  for (const [planName, plan] of uniquePlans) {
    // Find matching plan in database
    const { data: existing, error: findError } = await supabase
      .from('broadband_plans')
      .select('id, service_plan_name, typical_download_speed')
      .eq('provider_name', 'AT&T')
      .eq('is_active', true)
      .ilike('service_plan_name', `%${planName}%`)
      .limit(1)

    if (findError) {
      console.error(`Error finding plan "${planName}":`, findError)
      continue
    }

    if (!existing || existing.length === 0) {
      // Try exact match on tier_plan_name
      const { data: exact } = await supabase
        .from('broadband_plans')
        .select('id, tier_plan_name, typical_download_speed')
        .eq('provider_name', 'AT&T')
        .eq('is_active', true)
        .ilike('tier_plan_name', `%${planName}%`)
        .limit(1)

      if (!exact || exact.length === 0) {
        notFound++
        continue
      }
    }

    const match = existing?.[0]
    if (!match) continue

    // Update the plan with speed data
    const { error: updateError } = await supabase
      .from('broadband_plans')
      .update({
        typical_download_speed: plan.downloadSpeed,
        typical_upload_speed: plan.uploadSpeed,
        typical_latency: plan.latency,
      })
      .eq('id', match.id)

    if (updateError) {
      console.error(`Error updating plan ${match.id}:`, updateError)
    } else {
      updated++
      console.log(`Updated: ${planName} -> ${plan.downloadSpeed} Mbps`)
    }
  }

  console.log(`\nSummary:`)
  console.log(`  Updated: ${updated}`)
  console.log(`  Not found: ${notFound}`)

  // Also do a bulk update for plans that match by name pattern
  console.log('\nBulk updating plans by name patterns...')

  const bulkUpdates = [
    // Main consumer fiber plans
    { pattern: 'Internet 300 (Fiber%', download: 398, upload: 378, latency: 14 },
    { pattern: 'Internet 500 (Fiber%', download: 659, upload: 628, latency: 12 },
    { pattern: 'Internet 1000 (Fiber%', download: 997, upload: 925, latency: 12 },
    { pattern: 'Internet 2000 (Fiber%', download: 2526, upload: 2496, latency: 5 },
    { pattern: 'Internet 5000 (Fiber%', download: 5115, upload: 5315, latency: 5 },
    // AT&T Internet Air (fixed wireless)
    { pattern: '%Internet Air%', download: 150, upload: 20, latency: 48 },
    // Lower tier fiber
    { pattern: 'Internet 50 (Fiber%', download: 66, upload: 62, latency: 11 },
    { pattern: 'Internet 100 (Fiber%', download: 132, upload: 125, latency: 12 },
    // Copper DSL
    { pattern: 'Internet 25 (Copper%', download: 33, upload: 6, latency: 28 },
    { pattern: 'Internet 50 (Copper%', download: 58, upload: 12, latency: 26 },
    { pattern: 'Internet 75 (Copper%', download: 87, upload: 20, latency: 26 },
    { pattern: 'Internet 100 (Copper%', download: 108, upload: 22, latency: 24 },
    // eRate plans (business/education - fiber)
    { pattern: '%300M / 300M%', download: 300, upload: 300, latency: 11 },
    { pattern: '%500M / 500M%', download: 500, upload: 500, latency: 8 },
    { pattern: '%1G / 1G%', download: 1000, upload: 1000, latency: 8 },
    { pattern: '%2G / 2G%', download: 2000, upload: 2000, latency: 5 },
    { pattern: '%5G / 5G%', download: 5000, upload: 5000, latency: 5 },
  ]

  for (const update of bulkUpdates) {
    const { data, error } = await supabase
      .from('broadband_plans')
      .update({
        typical_download_speed: update.download,
        typical_upload_speed: update.upload,
        typical_latency: update.latency,
      })
      .eq('provider_name', 'AT&T')
      .eq('is_active', true)
      .eq('service_type', 'residential')
      .ilike('service_plan_name', update.pattern)
      .select('id')

    if (error) {
      console.error(`Error with pattern "${update.pattern}":`, error)
    } else if (data && data.length > 0) {
      console.log(`Updated ${data.length} plans matching "${update.pattern}" -> ${update.download} Mbps`)
    }
  }

  console.log('\nDone!')
}

main().catch(console.error)
