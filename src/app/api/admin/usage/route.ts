import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getUsageSummary, calculateCost } from '@/lib/apiUsageTracker'

// GET /api/admin/usage - Get usage statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = parseInt(searchParams.get('hours') || '24', 10)
    const detailed = searchParams.get('detailed') === 'true'

    // Get summary
    const summary = await getUsageSummary(hours)

    // If detailed, also return recent requests
    let recentRequests: Array<{
      created_at: string
      endpoint: string
      model: string | null
      input_tokens: number
      output_tokens: number
      cache_creation_tokens: number
      cache_read_tokens: number
      zip_code: string | null
      message_count: number
      estimated_cost: number
    }> = []

    if (detailed) {
      const supabase = createAdminClient()
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

      const { data } = await supabase
        .from('api_usage')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(100)

      if (data) {
        recentRequests = data.map(row => ({
          created_at: row.created_at,
          endpoint: row.endpoint,
          model: row.model,
          input_tokens: row.input_tokens || 0,
          output_tokens: row.output_tokens || 0,
          cache_creation_tokens: row.cache_creation_tokens || 0,
          cache_read_tokens: row.cache_read_tokens || 0,
          zip_code: row.zip_code,
          message_count: row.message_count || 0,
          estimated_cost: calculateCost({
            inputTokens: row.input_tokens || 0,
            outputTokens: row.output_tokens || 0,
            cacheCreationTokens: row.cache_creation_tokens || 0,
            cacheReadTokens: row.cache_read_tokens || 0,
            model: row.model,
          }),
        }))
      }
    }

    // Calculate cache efficiency
    const totalCacheTokens = summary.totalCacheCreationTokens + summary.totalCacheReadTokens
    const cacheHitRate = totalCacheTokens > 0
      ? (summary.totalCacheReadTokens / totalCacheTokens * 100).toFixed(1)
      : '0'

    // Calculate savings from caching
    // Cache read costs $0.08/M vs regular input at $0.80/M = 90% savings
    const savingsFromCache = (summary.totalCacheReadTokens / 1_000_000) * (0.80 - 0.08)

    return NextResponse.json({
      success: true,
      period: `Last ${hours} hours`,
      summary: {
        totalRequests: summary.totalRequests,
        totalInputTokens: summary.totalInputTokens,
        totalOutputTokens: summary.totalOutputTokens,
        totalCacheCreationTokens: summary.totalCacheCreationTokens,
        totalCacheReadTokens: summary.totalCacheReadTokens,
        cacheHitRate: `${cacheHitRate}%`,
        estimatedCost: `$${summary.estimatedCost.toFixed(4)}`,
        savingsFromCache: `$${savingsFromCache.toFixed(4)}`,
        byEndpoint: summary.byEndpoint,
        byModel: summary.byModel,
      },
      recentRequests: detailed ? recentRequests : undefined,
    })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get usage stats' },
      { status: 500 }
    )
  }
}
