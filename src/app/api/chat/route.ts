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
- Recommend they use our comparison tool at /compare?zip=XXXXX
- Provide general advice about what to look for in a provider

Keep responses concise, friendly, and helpful. Use bullet points for lists. If you don't know specific current pricing or availability, say so and recommend checking our comparison tool for up-to-date information.

Available tools on the site:
- Speed Test: /tools/speed-test - Test current internet speed
- ISP Quiz: /tools/quiz - Get personalized recommendations
- Compare Providers: /compare - Search by ZIP code`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { messages, zipCode } = await request.json() as { messages: Message[], zipCode?: string }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // If ZIP code provided, get provider context
    let providerContext = ''
    if (zipCode && /^\d{5}$/.test(zipCode)) {
      const supabase = createAdminClient()
      const { data: coverage } = await supabase
        .from('coverage')
        .select('provider_id')
        .eq('zip_code', zipCode)
        .eq('has_service', true)

      if (coverage && coverage.length > 0) {
        const providerIds = [...new Set(coverage.map(c => c.provider_id))]
        const { data: providers } = await supabase
          .from('providers')
          .select('name, technologies')
          .in('id', providerIds)

        if (providers && providers.length > 0) {
          providerContext = `\n\nProviders available in ZIP ${zipCode}:\n${providers.map(p =>
            `- ${p.name} (${(p.technologies || []).join(', ')})`
          ).join('\n')}`
        }
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
