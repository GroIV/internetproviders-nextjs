/* eslint-disable @typescript-eslint/no-explicit-any */
// API route uses dynamic Supabase response types
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getComparisonUrl } from '@/lib/affiliates'

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

            // Satellite providers to deprioritize (they show 100% coverage everywhere)
            const satelliteProviders = ['viasat', 'hughesnet', 'starlink', 'echostar', 'dish']

            providerNames = cbsaData
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
              // Filter out satellite providers for the welcome message
              .filter((n: string) => !satelliteProviders.some(sat => n.toLowerCase().includes(sat)))
              .slice(0, 5)
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

    // Build the welcome message - sales focused with order capability
    const orderUrl = getComparisonUrl('welcome')
    let message = ''

    if (city && providerNames.length > 0) {
      const topProviders = providerNames.slice(0, 3).join(', ')
      message = `Hi! I'm your AI internet advisor.\n\n`
      message += `I see you're in ${city}. I found ${providerCount}+ internet providers in your area, including ${topProviders}.\n\n`
      if (coverageInfo) {
        message += `${coverageInfo}\n\n`
      }
      message += `I can help you compare plans, find the best deals, and [place your order online](${orderUrl}) when you're ready. What are you looking for today?`
    } else if (city) {
      message = `Hi! I'm your AI internet advisor.\n\n`
      message += `I see you're in ${city}. I can help you find the best internet providers, compare plans, and [order service online](${orderUrl}) - all in one place.\n\n`
      message += `What matters most to you - speed, price, or reliability?`
    } else {
      message = `Hi! I'm your AI internet advisor.\n\n`
      message += `I can help you find the perfect internet provider, compare plans, and [place your order online](${orderUrl}) when you're ready.\n\n`
      message += `Tell me your ZIP code to get started, or ask me anything about internet service!`
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Welcome API error:', error)

    // Return a fallback message
    const fallbackOrderUrl = getComparisonUrl('welcome')
    return NextResponse.json({
      message: `Hi! I'm your AI internet advisor. I can help you compare providers, find the best deals, and [place your order online](${fallbackOrderUrl}). How can I help you today?`
    })
  }
}
