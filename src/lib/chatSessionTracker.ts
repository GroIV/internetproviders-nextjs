import { createAdminClient } from '@/lib/supabase/server'
import { calculateCost } from './apiUsageTracker'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatSessionData {
  sessionId: string
  zipCode?: string
  messages: ChatMessage[]
  model?: string
  inputTokens?: number
  outputTokens?: number
  providersDiscussed?: string[]
}

/**
 * Track or update a chat session for analytics
 */
export async function trackChatSession(data: ChatSessionData): Promise<void> {
  try {
    const supabase = createAdminClient()

    // Extract first user message as the "question"
    const firstMessage = data.messages.find(m => m.role === 'user')?.content || null

    // Calculate cost
    const cost = calculateCost({
      inputTokens: data.inputTokens || 0,
      outputTokens: data.outputTokens || 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      model: data.model,
    })

    // Check if session exists
    const { data: existing } = await supabase
      .from('chat_sessions')
      .select('id, total_input_tokens, total_output_tokens, total_cost')
      .eq('session_id', data.sessionId)
      .single()

    if (existing) {
      // Update existing session
      await supabase
        .from('chat_sessions')
        .update({
          messages: data.messages,
          message_count: data.messages.length,
          providers_discussed: data.providersDiscussed || [],
          total_input_tokens: (existing.total_input_tokens || 0) + (data.inputTokens || 0),
          total_output_tokens: (existing.total_output_tokens || 0) + (data.outputTokens || 0),
          total_cost: (existing.total_cost || 0) + cost,
          model: data.model,
        })
        .eq('session_id', data.sessionId)
    } else {
      // Create new session
      await supabase.from('chat_sessions').insert({
        session_id: data.sessionId,
        zip_code: data.zipCode || null,
        messages: data.messages,
        message_count: data.messages.length,
        providers_discussed: data.providersDiscussed || [],
        first_message: firstMessage,
        model: data.model || null,
        total_input_tokens: data.inputTokens || 0,
        total_output_tokens: data.outputTokens || 0,
        total_cost: cost,
      })
    }
  } catch (err) {
    console.error('[Chat Session Tracker] Error:', err)
  }
}

/**
 * Get chat analytics summary
 */
export async function getChatAnalytics(days: number = 7): Promise<{
  totalSessions: number
  totalMessages: number
  avgMessagesPerSession: number
  topZipCodes: Array<{ zip: string; count: number }>
  topProviders: Array<{ provider: string; count: number }>
  popularQuestions: Array<{ question: string; count: number }>
  sessionsOverTime: Array<{ date: string; count: number }>
  totalCost: number
}> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error || !sessions) {
    console.error('[Chat Analytics] Error:', error)
    return {
      totalSessions: 0,
      totalMessages: 0,
      avgMessagesPerSession: 0,
      topZipCodes: [],
      topProviders: [],
      popularQuestions: [],
      sessionsOverTime: [],
      totalCost: 0,
    }
  }

  // Calculate metrics
  const totalSessions = sessions.length
  const totalMessages = sessions.reduce((sum, s) => sum + (s.message_count || 0), 0)
  const avgMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0
  const totalCost = sessions.reduce((sum, s) => sum + (parseFloat(s.total_cost) || 0), 0)

  // Top ZIP codes
  const zipCounts = new Map<string, number>()
  for (const s of sessions) {
    if (s.zip_code) {
      zipCounts.set(s.zip_code, (zipCounts.get(s.zip_code) || 0) + 1)
    }
  }
  const topZipCodes = [...zipCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([zip, count]) => ({ zip, count }))

  // Top providers discussed
  const providerCounts = new Map<string, number>()
  for (const s of sessions) {
    for (const provider of (s.providers_discussed || [])) {
      providerCounts.set(provider, (providerCounts.get(provider) || 0) + 1)
    }
  }
  const topProviders = [...providerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([provider, count]) => ({ provider, count }))

  // Popular questions (first messages)
  const questionCounts = new Map<string, number>()
  for (const s of sessions) {
    if (s.first_message) {
      // Normalize question for grouping
      const normalized = s.first_message.toLowerCase().trim().slice(0, 100)
      questionCounts.set(normalized, (questionCounts.get(normalized) || 0) + 1)
    }
  }
  const popularQuestions = [...questionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([question, count]) => ({ question, count }))

  // Sessions over time (by day)
  const dateCounts = new Map<string, number>()
  for (const s of sessions) {
    const date = new Date(s.created_at).toISOString().split('T')[0]
    dateCounts.set(date, (dateCounts.get(date) || 0) + 1)
  }
  const sessionsOverTime = [...dateCounts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  return {
    totalSessions,
    totalMessages,
    avgMessagesPerSession: Math.round(avgMessagesPerSession * 10) / 10,
    topZipCodes,
    topProviders,
    popularQuestions,
    sessionsOverTime,
    totalCost: Math.round(totalCost * 1000) / 1000,
  }
}

/**
 * Get recent chat sessions for review
 */
export async function getRecentChatSessions(limit: number = 50): Promise<Array<{
  id: string
  sessionId: string
  zipCode: string | null
  messageCount: number
  firstMessage: string | null
  providersDiscussed: string[]
  totalCost: number
  createdAt: string
}>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('id, session_id, zip_code, message_count, first_message, providers_discussed, total_cost, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('[Chat Sessions] Error:', error)
    return []
  }

  return data.map(s => ({
    id: s.id,
    sessionId: s.session_id,
    zipCode: s.zip_code,
    messageCount: s.message_count,
    firstMessage: s.first_message,
    providersDiscussed: s.providers_discussed || [],
    totalCost: parseFloat(s.total_cost) || 0,
    createdAt: s.created_at,
  }))
}

/**
 * Get full chat session by ID
 */
export async function getChatSessionById(id: string): Promise<{
  id: string
  sessionId: string
  zipCode: string | null
  messages: ChatMessage[]
  messageCount: number
  providersDiscussed: string[]
  model: string | null
  totalInputTokens: number
  totalOutputTokens: number
  totalCost: number
  createdAt: string
} | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    sessionId: data.session_id,
    zipCode: data.zip_code,
    messages: data.messages || [],
    messageCount: data.message_count,
    providersDiscussed: data.providers_discussed || [],
    model: data.model,
    totalInputTokens: data.total_input_tokens,
    totalOutputTokens: data.total_output_tokens,
    totalCost: parseFloat(data.total_cost) || 0,
    createdAt: data.created_at,
  }
}
