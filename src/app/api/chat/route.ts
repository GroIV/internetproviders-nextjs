import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAffiliateUrl, getActiveAffiliateProviders, COMPARISON_ELIGIBLE_PROVIDERS, providerDisplayNames, getComparisonUrl } from '@/lib/affiliates'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Build dynamic order links section
function buildOrderLinksSection(): string {
  // Get all sellable providers
  const sellableProviders = Array.from(COMPARISON_ELIGIBLE_PROVIDERS)
  if (sellableProviders.length === 0) return ''

  const orderLinks = sellableProviders.map(providerId => {
    const url = getAffiliateUrl(providerId, 'chat')
    const displayName = providerDisplayNames[providerId] || providerId
    return `- ${displayName}: [Order ${displayName}](${url})`
  }).join('\n')

  // Also add a general comparison link
  const comparisonUrl = getComparisonUrl('chat')

  return `

ORDER LINKS - When users want to sign up or order service:
If a user expresses interest in signing up, ordering, or getting service from one of these providers, include the order link. Use friendly call-to-action text.

Providers we can help users order:
${orderLinks}

General comparison page (use when user wants to compare multiple options):
- Compare all providers: [Compare Internet Providers](${comparisonUrl})

IMPORTANT - When a user says they want to ORDER:
When a user expresses clear intent to order/sign up/buy (e.g., "I want to order AT&T", "Sign me up for Xfinity", "How do I get Spectrum"), this is a BUYING SIGNAL. Do NOT:
- Suggest they wait or do more research
- Recommend taking quizzes or speed tests first
- List reasons to hesitate
- Add friction to the purchase

Instead, DO:
- Enthusiastically provide the order link immediately
- Keep the response short and action-focused
- Express excitement about their choice
- Only mention 1-2 quick positive points if relevant

Example responses when user wants to ORDER:
- "Excellent choice! [Order AT&T Internet here](ORDER_URL) to get started. They have great coverage in your area!"
- "Let's get you connected! [Sign up for Xfinity here](ORDER_URL) - you'll love their speeds."
- "[Order Verizon Fios](ORDER_URL) - great pick! They offer some of the fastest fiber speeds available."

Example responses for general questions (not ordering yet):
- "Want to see all your options? [Compare providers in your area](${comparisonUrl}) to find the best deal."

Only include order links when contextually appropriate - but when someone wants to order, make it easy!`
}

const SYSTEM_PROMPT = `You are an expert internet service advisor for InternetProviders.ai. Your role is to help users find the best internet service for their needs.

You have deep knowledge about:
- Different internet technologies (Fiber, Cable, DSL, Satellite, Fixed Wireless, 5G)
- Major internet service providers in the United States
- Internet speeds and what they're suitable for (streaming, gaming, work from home, etc.)
- Pricing and plan comparisons
- Technical concepts like latency, bandwidth, upload vs download speeds

CRITICAL - Technology Priority (ALWAYS follow this order):
When recommending providers, ALWAYS prioritize in this order:
1. **Fiber** (best) - Fastest, lowest latency, symmetrical speeds, most reliable
2. **Cable** - Fast, widely available, good for most users
3. **5G Home Internet** - Good speeds, no installation, but coverage varies
4. **Fixed Wireless** - Decent option in suburban/rural areas
5. **DSL** - Older technology, slower, but better than satellite
6. **Satellite** (last resort) - ONLY recommend if NO other options exist

IMPORTANT - Satellite Provider Rules:
- Satellite providers (Starlink, Viasat, HughesNet) should ONLY be recommended for rural areas with NO fiber, cable, or fixed wireless options
- NEVER recommend satellite when fiber or cable is available - satellite has high latency (bad for gaming/video calls), weather interference, and often data caps
- If the coverage data shows fiber or cable providers, do NOT mention satellite at all
- If a user specifically asks about satellite, explain the drawbacks compared to wired options

When users ask about providers in their area:
- If they mention a ZIP code, acknowledge it and offer to help them find providers
- Lead with fiber/cable options if available
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
- [Compare Providers](/compare) - Search by ZIP code (add ?zip=XXXXX if you know their ZIP)` + buildOrderLinksSection()

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

            // Satellite providers to filter out when better options exist
            const satelliteKeywords = ['viasat', 'hughesnet', 'starlink', 'echostar', 'dish network']

            const allProviders = cbsaData
              .map((cp: any) => ({
                name: nameMap.get(cp.provider_id) || 'Unknown',
                coverage: Math.round(cp.coverage_pct * 100),
              }))
              .filter((p: any) => p.name !== 'Unknown')

            // Check if we have fiber or cable providers
            const hasFiberOrCable = allProviders.some((p: any) => {
              const nameLower = p.name.toLowerCase()
              // Common fiber/cable providers
              return nameLower.includes('at&t') ||
                     nameLower.includes('verizon') ||
                     nameLower.includes('spectrum') ||
                     nameLower.includes('xfinity') ||
                     nameLower.includes('comcast') ||
                     nameLower.includes('cox') ||
                     nameLower.includes('frontier') ||
                     nameLower.includes('google fiber') ||
                     nameLower.includes('centurylink') ||
                     nameLower.includes('optimum') ||
                     nameLower.includes('altice') ||
                     nameLower.includes('charter')
            })

            // Filter out satellite if fiber/cable available
            const providers = hasFiberOrCable
              ? allProviders.filter((p: any) =>
                  !satelliteKeywords.some(sat => p.name.toLowerCase().includes(sat))
                )
              : allProviders

            if (providers.length > 0) {
              providerContext = `\n\nThe user is in ZIP code ${zipCode}. Here are the internet providers available in their area:\n${providers.map((p: any) =>
                `- ${p.name} (${p.coverage}% area coverage)`
              ).join('\n')}\n\nUse this information to give personalized recommendations. Focus on fiber and cable options first. You can reference specific providers and their coverage when answering questions.`
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
