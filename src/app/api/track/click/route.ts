import { NextRequest, NextResponse } from 'next/server'
import { trackAffiliateClick } from '@/lib/affiliateTracker'

// POST /api/track/click - Track affiliate click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      providerSlug,
      providerName,
      linkType,
      planId,
      planName,
      zipCode,
      pageUrl,
      sessionId,
    } = body

    if (!providerSlug) {
      return NextResponse.json({ error: 'providerSlug required' }, { status: 400 })
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || undefined
    const referrer = request.headers.get('referer') || undefined
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      undefined

    // Track async (don't block response)
    trackAffiliateClick({
      providerSlug,
      providerName,
      linkType,
      planId,
      planName,
      zipCode,
      pageUrl,
      referrer,
      userAgent,
      ipAddress,
      sessionId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Click tracking error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

// GET endpoint for pixel tracking (image beacon)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const providerSlug = searchParams.get('provider')

  if (providerSlug) {
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      undefined

    trackAffiliateClick({
      providerSlug,
      providerName: searchParams.get('name') || undefined,
      linkType: (searchParams.get('type') as 'website' | 'phone' | 'plan') || 'website',
      zipCode: searchParams.get('zip') || undefined,
      pageUrl: searchParams.get('page') || undefined,
      referrer: request.headers.get('referer') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress,
    })
  }

  // Return 1x1 transparent GIF
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  return new NextResponse(gif, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
