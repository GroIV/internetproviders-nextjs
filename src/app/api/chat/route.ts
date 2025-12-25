import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAffiliateUrl, getActiveAffiliateProviders, COMPARISON_ELIGIBLE_PROVIDERS, providerDisplayNames, getComparisonUrl } from '@/lib/affiliates'
import { featuredPlans, getBestValuePlans, getAllFeaturedPlans, type FeaturedPlan } from '@/lib/featuredPlans'

// Plan with provider info for suggestions
interface SuggestedPlan extends FeaturedPlan {
  providerName: string
  providerSlug: string
}

// Keywords that indicate user is asking about plans/pricing
const PLAN_KEYWORDS = [
  'plan', 'plans', 'pricing', 'price', 'cost', 'how much',
  'recommend', 'recommendation', 'best', 'cheapest', 'fastest',
  'what should i get', 'which one', 'compare', 'options',
  'fiber', 'cable', '5g', 'internet service', 'package', 'packages',
  'value', 'budget', 'premium', 'speed', 'mbps', 'gbps',
  'frontier', 'at&t', 'att', 'spectrum', 't-mobile', 'tmobile'
]

// Detect if user message is asking about plans
function isPlanQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return PLAN_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

// Map database provider names to featured plan slugs
function mapProviderNameToSlug(providerName: string): string | null {
  const nameLower = providerName.toLowerCase()
  if (nameLower.includes('at&t')) return 'att-internet'
  if (nameLower.includes('spectrum') || nameLower.includes('charter')) return 'spectrum'
  if (nameLower.includes('frontier')) return 'frontier-fiber'
  if (nameLower.includes('t-mobile')) return 't-mobile'
  return null
}

// Get relevant plans based on user query and available providers
function getSuggestedPlans(message: string, availableProviderNames?: string[]): SuggestedPlan[] {
  const lowerMessage = message.toLowerCase()
  let allPlans = getAllFeaturedPlans()

  // FIRST: Filter by available providers in user's ZIP (if we have that data)
  if (availableProviderNames && availableProviderNames.length > 0) {
    const availableSlugs = availableProviderNames
      .map(name => mapProviderNameToSlug(name))
      .filter((slug): slug is string => slug !== null)

    if (availableSlugs.length > 0) {
      allPlans = allPlans.filter(p => availableSlugs.includes(p.providerSlug))
    }
  }

  // If no plans available after ZIP filtering, return empty (don't show irrelevant plans)
  if (allPlans.length === 0) {
    return []
  }

  // Check for specific provider mentions
  const mentionedProviders: string[] = []
  if (lowerMessage.includes('frontier')) mentionedProviders.push('frontier-fiber')
  if (lowerMessage.includes('at&t') || lowerMessage.includes('att')) mentionedProviders.push('att-internet')
  if (lowerMessage.includes('spectrum')) mentionedProviders.push('spectrum')
  if (lowerMessage.includes('t-mobile') || lowerMessage.includes('tmobile')) mentionedProviders.push('t-mobile')

  // Check for tier preferences
  const wantsBudget = lowerMessage.includes('cheap') || lowerMessage.includes('budget') || lowerMessage.includes('affordable')
  const wantsPremium = lowerMessage.includes('fast') || lowerMessage.includes('premium') || lowerMessage.includes('best speed') || lowerMessage.includes('gaming')
  const wantsValue = lowerMessage.includes('value') || lowerMessage.includes('recommend') || lowerMessage.includes('best')

  // Check for technology preferences
  const wantsFiber = lowerMessage.includes('fiber')
  const wants5G = lowerMessage.includes('5g') || lowerMessage.includes('wireless')
  const wantsCable = lowerMessage.includes('cable')

  let filteredPlans = allPlans

  // Filter by mentioned providers (only if they're available in user's area)
  if (mentionedProviders.length > 0) {
    const availableMentioned = filteredPlans.filter(p => mentionedProviders.includes(p.providerSlug))
    if (availableMentioned.length > 0) {
      filteredPlans = availableMentioned
    }
    // If mentioned provider not available, we'll show what IS available
  }

  // Filter by technology
  if (wantsFiber) {
    const fiberPlans = filteredPlans.filter(p => p.technology === 'Fiber')
    if (fiberPlans.length > 0) filteredPlans = fiberPlans
  } else if (wants5G) {
    const fiveGPlans = filteredPlans.filter(p => p.technology === '5G')
    if (fiveGPlans.length > 0) filteredPlans = fiveGPlans
  } else if (wantsCable) {
    const cablePlans = filteredPlans.filter(p => p.technology === 'Cable')
    if (cablePlans.length > 0) filteredPlans = cablePlans
  }

  // Filter by tier preference
  if (wantsBudget) {
    const budgetPlans = filteredPlans.filter(p => p.tier === 'budget')
    if (budgetPlans.length > 0) filteredPlans = budgetPlans
  } else if (wantsPremium) {
    const premiumPlans = filteredPlans.filter(p => p.tier === 'premium')
    if (premiumPlans.length > 0) filteredPlans = premiumPlans
  } else if (wantsValue) {
    // For general "best" queries, prioritize value tier but include others
    const valuePlans = filteredPlans.filter(p => p.tier === 'value')
    if (valuePlans.length > 0) {
      filteredPlans = valuePlans
    }
  }

  // Sort by value score (speed per dollar)
  filteredPlans.sort((a, b) => (b.downloadSpeed / b.price) - (a.downloadSpeed / a.price))

  // Limit to 4 plans max for display
  return filteredPlans.slice(0, 4) as SuggestedPlan[]
}

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

// Build featured plans section with real pricing data
function buildFeaturedPlansSection(): string {
  const lines = [
    '\n\nFEATURED RESIDENTIAL INTERNET PLANS (Real FCC-Verified Pricing):',
    'When users ask about plans, pricing, or recommendations, use this accurate data:\n'
  ]

  for (const provider of featuredPlans) {
    lines.push(`**${provider.providerName}** (${provider.plans[0].technology}):`)
    for (const plan of provider.plans) {
      const speedStr = plan.uploadSpeed === plan.downloadSpeed
        ? `${plan.downloadSpeed}/${plan.uploadSpeed} Mbps symmetric`
        : `${plan.downloadSpeed}/${plan.uploadSpeed} Mbps`
      const tierLabel = plan.tier === 'budget' ? 'Budget' : plan.tier === 'value' ? 'Best Value' : 'Premium'
      lines.push(`  - ${plan.planName}: $${plan.price}/mo - ${speedStr} [${tierLabel}]`)
    }
    lines.push('')
  }

  // Add best value rankings
  const valueRanked = getBestValuePlans()
  lines.push('BEST VALUE RANKINGS (by speed per dollar):')
  valueRanked.slice(0, 4).forEach((plan, i) => {
    lines.push(`${i + 1}. ${plan.providerName} ${plan.planName} - $${plan.price}/mo for ${plan.downloadSpeed} Mbps`)
  })

  lines.push('\nWhen recommending plans:')
  lines.push('- Always mention specific plan names and accurate prices')
  lines.push('- Highlight symmetric upload speeds for fiber plans (great for video calls, uploads)')
  lines.push('- Frontier Fiber 500 at $54.99 is the best value in most markets')
  lines.push('- Include the order link for the provider when suggesting a plan')

  return lines.join('\n')
}

const SYSTEM_PROMPT = `You are an expert internet service advisor for InternetProviders.ai. Your role is to help users find the best internet service for their needs AND convert them into customers by directing them to order links.

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

**CRITICAL - ADDRESS-SPECIFIC AVAILABILITY:**
We only have ZIP-level and regional coverage data. We do NOT have address-specific serviceability information.

When users ask questions like:
- "Is [provider] available at my address?"
- "Can I get fiber at my house?"
- "What providers service my street/apartment/building?"
- "Is [provider] available where I live?"
- "What speeds can I actually get?"
- Any question about availability at a SPECIFIC ADDRESS

You MUST respond by:
1. Acknowledge we have area-level data showing the provider operates in their region
2. Explain that the ONLY way to confirm exact address availability and see real pricing is to check directly with the provider
3. Provide the order link and STRONGLY encourage them to click through - it's free, takes 30 seconds, and they'll get accurate info
4. Be direct and confident - don't be wishy-washy

Example responses for address-specific questions:
- "Based on your ZIP code, AT&T does serve your area. But here's the thing - the only way to know 100% if they can service YOUR specific address and what speeds you'll get is to [check with AT&T directly](ORDER_URL). It takes 30 seconds and you'll see exact plans and pricing for your address. Worth a quick look!"
- "I can see Spectrum covers your region, but availability varies street by street. [Click here to check your exact address](ORDER_URL) - you'll instantly see if you can get service and what deals are available. No commitment, just real info!"
- "Great question! Fiber availability is very address-specific. The quickest way to find out is to [check directly with the provider](ORDER_URL). They'll show you exactly what's available at your address - speeds, pricing, everything. Takes less than a minute!"

**BE AGGRESSIVE ABOUT CONVERSION:**
- Don't let users endlessly browse and research. After 2-3 exchanges, start pushing toward action.
- When users seem indecisive or keep asking similar questions, cut to the chase: "Look, I can give you general info all day, but to get real answers for YOUR address, you need to [check availability here](ORDER_URL). It's free and takes 30 seconds."
- Position clicking the order link as the SOLUTION, not a sales pitch. They WANT accurate info - we're helping them get it.

IMPORTANT - Link Formatting:
Always use markdown link syntax when referencing site pages or tools. Never output bare URLs or paths.

Keep responses concise and action-oriented. Use bullet points for lists. Always end with a clear call-to-action when appropriate.

Available tools on the site (always link these with markdown):
- [Speed Test](/tools/speed-test) - Test current internet speed
- [ISP Quiz](/tools/quiz) - Get personalized recommendations
- [Compare Providers](/compare) - Search by ZIP code (add ?zip=XXXXX if you know their ZIP)` + buildOrderLinksSection() + buildFeaturedPlansSection()

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
    let availableProviderNames: string[] = [] // Track providers available in user's ZIP

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
              // Store provider names for plan filtering
              availableProviderNames = providers.map((p: any) => p.name)

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

    // Get the last user message to check for plan queries
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || ''

    // Determine if we should show suggested plans (only if we have ZIP-based availability data)
    const shouldShowPlans = isPlanQuery(lastUserMessage)
    const suggestedPlans = shouldShowPlans ? getSuggestedPlans(lastUserMessage, availableProviderNames) : []

    return NextResponse.json({
      message: assistantMessage,
      suggestedPlans: suggestedPlans.length > 0 ? suggestedPlans : undefined,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    )
  }
}
