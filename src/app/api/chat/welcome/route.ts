import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { zipCode, city } = await request.json()

    let providerNames: string[] = []
    let providerCount = 0
    let coverageInfo = ''

    if (zipCode && /^\d{5}$/.test(zipCode)) {
      const supabase = createAdminClient()

      // Get CBSA code for this ZIP
      const { data: zipData } = await supabase
        .from('zip_cbsa_mapping')
        .select('cbsa_code')
        .eq('zip_code', zipCode)
        .single()

      if (zipData) {
        // Get providers for this CBSA
        const { data: cbsaData } = await supabase
          .from('cbsa_providers')
          .select('provider_id, coverage_pct')
          .eq('cbsa_code', zipData.cbsa_code)
          .order('coverage_pct', { ascending: false })
          .limit(10)

        if (cbsaData && cbsaData.length > 0) {
          providerCount = cbsaData.length

          // Get provider names
          const providerIds = cbsaData.map((p: any) => p.provider_id)
          const { data: providers } = await supabase
            .from('fcc_providers')
            .select('provider_id, name')
            .in('provider_id', providerIds)

          if (providers && providers.length > 0) {
            // Map provider IDs to names and clean up names
            const nameMap = new Map(providers.map((p: any) => [p.provider_id, p.name]))

            providerNames = cbsaData
              .slice(0, 5)
              .map((cp: any) => {
                let name = nameMap.get(cp.provider_id) || ''
                // Clean up corporate names to consumer-facing names
                name = name
                  .replace(/, Inc\.|Inc\.|Corporation|Corp\.|LLC|, LP/gi, '')
                  .replace('Charter Communications', 'Spectrum')
                  .replace('Comcast Cable', 'Xfinity')
                  .replace('Space Exploration Technologies', 'Starlink')
                  .replace('T-Mobile USA', 'T-Mobile')
                  .replace('Verizon Business', 'Verizon')
                  .replace('AT&T Corp', 'AT&T')
                  .trim()
                return name
              })
              .filter((n: string) => n && n !== 'Unknown')
          }
        }
      }

      // Get broadband coverage stats
      const { data: coverageStats } = await supabase
        .from('zip_broadband_coverage')
        .select('any_100_20, fiber_100_20')
        .eq('zip_code', zipCode)
        .single()

      if (coverageStats) {
        const fiberPct = coverageStats.fiber_100_20 ? Math.round(coverageStats.fiber_100_20 * 100) : 0
        const anyPct = coverageStats.any_100_20 ? Math.round(coverageStats.any_100_20 * 100) : 0

        if (fiberPct > 50) {
          coverageInfo = `Great news - ${fiberPct}% of your area has fiber internet access!`
        } else if (anyPct > 80) {
          coverageInfo = `${anyPct}% of your area has access to high-speed internet.`
        }
      }
    }

    // Build the welcome message
    let message = ''

    if (city && providerNames.length > 0) {
      const topProviders = providerNames.slice(0, 3).join(', ')
      message = `Hi! I'm your AI internet advisor.\n\n`
      message += `I see you're in ${city}. I found ${providerCount}+ internet providers in your area, including ${topProviders}.\n\n`
      if (coverageInfo) {
        message += `${coverageInfo}\n\n`
      }
      message += `What are you looking for? Fast speeds for gaming? Budget-friendly options? Or help comparing plans?`
    } else if (city) {
      message = `Hi! I'm your AI internet advisor.\n\n`
      message += `I see you're in ${city}. I can help you find and compare internet providers in your area.\n\n`
      message += `What matters most to you - speed, price, reliability, or something else?`
    } else {
      message = `Hi! I'm your AI internet advisor.\n\n`
      message += `I can help you find the perfect internet provider. Tell me your ZIP code, or just ask me anything about internet service!\n\n`
      message += `What can I help you with today?`
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Welcome API error:', error)

    // Return a fallback message
    return NextResponse.json({
      message: "Hi! I'm your AI internet advisor. How can I help you find the perfect internet provider today?"
    })
  }
}
