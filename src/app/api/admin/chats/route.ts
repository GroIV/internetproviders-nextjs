import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { calculateCost } from '@/lib/apiUsageTracker'

// GET /api/admin/chats - Get chat conversation logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = parseInt(searchParams.get('hours') || '24', 10)

    const supabase = createAdminClient()
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    // Get chat logs (filter by /api/chat endpoint)
    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('endpoint', '/api/chat')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('Error fetching chats:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch chat logs' },
        { status: 500 }
      )
    }

    // Process chat logs
    const chats = (data || []).map(row => ({
      id: row.id,
      created_at: row.created_at,
      model: row.model,
      zip_code: row.zip_code,
      message_count: row.message_count || 0,
      input_tokens: row.input_tokens || 0,
      output_tokens: row.output_tokens || 0,
      response_time_ms: row.response_time_ms,
      error: row.error,
      estimated_cost: calculateCost({
        inputTokens: row.input_tokens || 0,
        outputTokens: row.output_tokens || 0,
        cacheCreationTokens: row.cache_creation_tokens || 0,
        cacheReadTokens: row.cache_read_tokens || 0,
        model: row.model,
      }),
    }))

    // Calculate stats
    const totalChats = chats.length
    const avgMessages = totalChats > 0
      ? chats.reduce((sum, c) => sum + c.message_count, 0) / totalChats
      : 0

    const chatsWithResponseTime = chats.filter(c => c.response_time_ms)
    const avgResponseTime = chatsWithResponseTime.length > 0
      ? chatsWithResponseTime.reduce((sum, c) => sum + (c.response_time_ms || 0), 0) / chatsWithResponseTime.length
      : 0

    const errorCount = chats.filter(c => c.error).length
    const errorRate = totalChats > 0 ? (errorCount / totalChats) * 100 : 0

    // Top ZIP codes
    const zipCounts = new Map<string, number>()
    for (const chat of chats) {
      if (chat.zip_code) {
        zipCounts.set(chat.zip_code, (zipCounts.get(chat.zip_code) || 0) + 1)
      }
    }
    const topZips = [...zipCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([zip, count]) => ({ zip, count }))

    return NextResponse.json({
      success: true,
      period: `Last ${hours} hours`,
      chats,
      stats: {
        totalChats,
        avgMessages,
        avgResponseTime,
        errorRate,
        topZips,
      },
    })
  } catch (error) {
    console.error('Chats API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get chat logs' },
      { status: 500 }
    )
  }
}
