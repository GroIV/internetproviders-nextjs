import { NextRequest, NextResponse } from 'next/server'
import { getAffiliateAnalytics, getRecentAffiliateClicks } from '@/lib/affiliateTracker'

// GET /api/admin/affiliate
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30', 10)
  const recent = searchParams.get('recent') === 'true'
  const limit = parseInt(searchParams.get('limit') || '100', 10)

  try {
    if (recent) {
      const clicks = await getRecentAffiliateClicks(limit)
      return NextResponse.json({ success: true, clicks })
    }

    const analytics = await getAffiliateAnalytics(days)
    return NextResponse.json({ success: true, analytics })
  } catch (error) {
    console.error('Affiliate analytics error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
