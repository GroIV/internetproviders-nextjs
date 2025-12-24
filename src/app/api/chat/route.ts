import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert internet service advisor for InternetProviders.ai. Your role is to help users find the best internet service for their needs.

You have deep knowledge about:
- Different internet technologies (Fiber, Cable, DSL, Satellite, Fixed Wireless, 5G)
- Major internet service providers in the United States
- Internet speeds and what they're suitable for (streaming, gaming, work from home, etc.)
- Pricing and plan comparisons
- Technical concepts like latency, bandwidth, upload vs download speeds

When users ask about providers in their area:
- If they mention a ZIP code, acknowledge it and offer to help them find providers
- Recommend relevant tools using markdown links (see below)
- Provide general advice about what to look for in a provider

IMPORTANT - Link Formatting:
Always use markdown link syntax when referencing site pages or tools. Never output bare URLs or paths.
Examples:
- "Check our [comparison tool](/compare?zip=78232) for current pricing"
- "Try our [speed test](/tools/speed-test) to check your connection"
- "Take the [ISP quiz](/tools/quiz) for personalized recommendations"
- "Learn more about [Xfinity](/providers/xfinity)"

Keep responses concise, friendly, and helpful. Use bullet points for lists. If you don't know specific current pricing or availability, say so and recommend checking our comparison tool for up-to-date information.

Available tools on the site (always link these with markdown):
- [Speed Test](/tools/speed-test) - Test current internet speed
- [ISP Quiz](/tools/quiz) - Get personalized recommendations
- [Compare Providers](/compare) - Search by ZIP code (add ?zip=XXXXX if you know their ZIP)`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { messages, zipCode, pageContext } = await request.json() as {
      messages: Message[]
      zipCode?: string
      pageContext?: string
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // If ZIP code provided, get provider context from database
    let providerContext = ''

    // Add page context if provided
    if (pageContext) {
      providerContext += `\n\nCurrent page context: ${pageContext}`
    }
    if (zipCode && /^\d{5}$/.test(zipCode)) {
      const supabase = createAdminClient()

      // Step 1: Get CBSA code for this ZIP
      const { data: zipData } = await supabase
        .from('zip_cbsa_mapping')
        .select('cbsa_code')
        .eq('zip_code', zipCode)
        .single()

      if (zipData) {
        // Step 2: Get providers for this CBSA
        const { data: cbsaData } = await supabase
          .from('cbsa_providers')
          .select('provider_id, coverage_pct')
          .eq('cbsa_code', zipData.cbsa_code)
          .order('coverage_pct', { ascending: false })
          .limit(15)

        if (cbsaData && cbsaData.length > 0) {
          // Step 3: Get provider names
          const providerIds = cbsaData.map((p: any) => p.provider_id)
          const { data: providerNames } = await supabase
            .from('fcc_providers')
            .select('provider_id, name')
            .in('provider_id', providerIds)

          if (providerNames && providerNames.length > 0) {
            const nameMap = new Map(providerNames.map((p: any) => [p.provider_id, p.name]))

            const providers = cbsaData
              .map((cp: any) => ({
                name: nameMap.get(cp.provider_id) || 'Unknown',
                coverage: Math.round(cp.coverage_pct * 100),
              }))
              .filter((p: any) => p.name !== 'Unknown')

            if (providers.length > 0) {
              providerContext = `\n\nThe user is in ZIP code ${zipCode}. Here are the internet providers available in their area:\n${providers.map((p: any) =>
                `- ${p.name} (${p.coverage}% area coverage)`
              ).join('\n')}\n\nUse this information to give personalized recommendations. You can reference specific providers and their coverage when answering questions.`
            }
          }
        }
      }

      // Also get broadband coverage stats
      const { data: coverageStats } = await supabase
        .from('zip_broadband_coverage')
        .select('city, any_100_20, fiber_100_20, cable_100_20')
        .eq('zip_code', zipCode)
        .single()

      if (coverageStats) {
        const fiberPct = coverageStats.fiber_100_20 ? Math.round(coverageStats.fiber_100_20 * 100) : 0
        const cablePct = coverageStats.cable_100_20 ? Math.round(coverageStats.cable_100_20 * 100) : 0
        const anyPct = coverageStats.any_100_20 ? Math.round(coverageStats.any_100_20 * 100) : 0

        providerContext += `\n\nCoverage statistics for ${coverageStats.city || `ZIP ${zipCode}`}:
- ${anyPct}% have access to 100+ Mbps internet
- ${fiberPct}% have fiber internet access
- ${cablePct}% have cable internet access`
      }
    }

    const systemPrompt = SYSTEM_PROMPT + providerContext

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    })

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    return NextResponse.json({
      message: assistantMessage,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    )
  }
}
