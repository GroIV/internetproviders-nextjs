import { NextRequest, NextResponse } from 'next/server'
import { getChatAnalytics, getRecentChatSessions, getChatSessionById } from '@/lib/chatSessionTracker'

// GET /api/admin/chat-analytics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '7', 10)
  const sessionId = searchParams.get('sessionId')
  const recent = searchParams.get('recent') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  try {
    // Get specific session by ID
    if (sessionId) {
      const session = await getChatSessionById(sessionId)
      if (!session) {
        return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, session })
    }

    // Get recent sessions list
    if (recent) {
      const sessions = await getRecentChatSessions(limit)
      return NextResponse.json({ success: true, sessions })
    }

    // Get analytics summary
    const analytics = await getChatAnalytics(days)
    return NextResponse.json({ success: true, analytics })
  } catch (error) {
    console.error('Chat analytics error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
