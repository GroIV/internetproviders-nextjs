import { createAdminClient } from '@/lib/supabase/server'

interface ApiUsageData {
  endpoint: string
  model?: string
  inputTokens?: number
  outputTokens?: number
  cacheCreationTokens?: number
  cacheReadTokens?: number
  zipCode?: string
  messageCount?: number
  responseTimeMs?: number
  error?: string
  metadata?: Record<string, unknown>
}

/**
 * Track API usage to the database for cost monitoring
 * Runs async and doesn't block the response
 */
export async function trackApiUsage(data: ApiUsageData): Promise<void> {
  try {
    const supabase = createAdminClient()

    await supabase.from('api_usage').insert({
      endpoint: data.endpoint,
      model: data.model || null,
      input_tokens: data.inputTokens || 0,
      output_tokens: data.outputTokens || 0,
      cache_creation_tokens: data.cacheCreationTokens || 0,
      cache_read_tokens: data.cacheReadTokens || 0,
      zip_code: data.zipCode || null,
      message_count: data.messageCount || 0,
      response_time_ms: data.responseTimeMs || null,
      error: data.error || null,
      metadata: data.metadata || {},
    })
  } catch (err) {
    // Don't let tracking errors affect the API response
    console.error('[API Usage Tracker] Error:', err)
  }
}

/**
 * Calculate estimated cost based on model pricing
 *
 * GPT-4o-mini (Jan 2025):
 * - Input: $0.15 per million tokens
 * - Output: $0.60 per million tokens
 *
 * Claude 3.5 Haiku (Jan 2025):
 * - Input: $0.80 per million tokens
 * - Output: $4.00 per million tokens
 * - Cache write: $1.00 per million tokens
 * - Cache read: $0.08 per million tokens
 */
export function calculateCost(usage: {
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
  model?: string
}): number {
  // GPT-4o-mini pricing (much cheaper!)
  if (usage.model === 'gpt-4o-mini') {
    const inputCost = (usage.inputTokens / 1_000_000) * 0.15
    const outputCost = (usage.outputTokens / 1_000_000) * 0.60
    return inputCost + outputCost
  }

  // Claude 3.5 Haiku pricing (default/fallback)
  const inputCost = (usage.inputTokens / 1_000_000) * 0.80
  const outputCost = (usage.outputTokens / 1_000_000) * 4.00
  const cacheWriteCost = (usage.cacheCreationTokens / 1_000_000) * 1.00
  const cacheReadCost = (usage.cacheReadTokens / 1_000_000) * 0.08

  return inputCost + outputCost + cacheWriteCost + cacheReadCost
}

/**
 * Get usage summary for a time period
 */
export async function getUsageSummary(hours: number = 24): Promise<{
  totalRequests: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCacheCreationTokens: number
  totalCacheReadTokens: number
  estimatedCost: number
  byEndpoint: Record<string, number>
  byModel: Record<string, number>
}> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('api_usage')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('[API Usage Tracker] Error fetching summary:', error)
    return {
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCacheCreationTokens: 0,
      totalCacheReadTokens: 0,
      estimatedCost: 0,
      byEndpoint: {},
      byModel: {},
    }
  }

  const summary = {
    totalRequests: data.length,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCacheCreationTokens: 0,
    totalCacheReadTokens: 0,
    estimatedCost: 0,
    byEndpoint: {} as Record<string, number>,
    byModel: {} as Record<string, number>,
  }

  for (const row of data) {
    summary.totalInputTokens += row.input_tokens || 0
    summary.totalOutputTokens += row.output_tokens || 0
    summary.totalCacheCreationTokens += row.cache_creation_tokens || 0
    summary.totalCacheReadTokens += row.cache_read_tokens || 0
    summary.byEndpoint[row.endpoint] = (summary.byEndpoint[row.endpoint] || 0) + 1

    // Track by model
    const model = row.model || 'unknown'
    summary.byModel[model] = (summary.byModel[model] || 0) + 1

    // Calculate cost per row based on model (more accurate)
    summary.estimatedCost += calculateCost({
      inputTokens: row.input_tokens || 0,
      outputTokens: row.output_tokens || 0,
      cacheCreationTokens: row.cache_creation_tokens || 0,
      cacheReadTokens: row.cache_read_tokens || 0,
      model: row.model,
    })
  }

  return summary
}
