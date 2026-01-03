import { NextResponse } from 'next/server'

const SENTRY_ORG = 'funneleads'
const SENTRY_PROJECT = 'internetproviders-nextjs'

interface SentryIssue {
  id: string
  title: string
  culprit: string
  shortId: string
  count: string
  userCount: number
  firstSeen: string
  lastSeen: string
  level: 'error' | 'warning' | 'info'
  status: 'unresolved' | 'resolved' | 'ignored'
  platform: string
}

// GET /api/admin/errors - Get Sentry issues
export async function GET() {
  const authToken = process.env.SENTRY_AUTH_TOKEN

  if (!authToken) {
    return NextResponse.json({
      success: false,
      error: 'SENTRY_AUTH_TOKEN not configured',
      issues: [],
      stats: null,
    })
  }

  try {
    // Fetch unresolved issues from Sentry
    const response = await fetch(
      `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?query=is:unresolved&statsPeriod=14d&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Sentry API error:', response.status, errorText)
      return NextResponse.json({
        success: false,
        error: `Sentry API error: ${response.status}`,
        issues: [],
        stats: null,
      })
    }

    const rawIssues = await response.json()

    // Transform to our format
    const issues: SentryIssue[] = rawIssues.map((issue: Record<string, unknown>) => ({
      id: issue.id,
      title: issue.title,
      culprit: issue.culprit || 'Unknown',
      shortId: issue.shortId,
      count: issue.count,
      userCount: issue.userCount || 0,
      firstSeen: issue.firstSeen,
      lastSeen: issue.lastSeen,
      level: issue.level || 'error',
      status: issue.status || 'unresolved',
      platform: issue.platform || 'javascript',
    }))

    // Calculate stats
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const last24hCount = issues.filter(
      issue => new Date(issue.lastSeen) > oneDayAgo
    ).length

    const unresolvedCount = issues.filter(
      issue => issue.status === 'unresolved'
    ).length

    // Find top platform
    const platformCounts = new Map<string, number>()
    for (const issue of issues) {
      platformCounts.set(issue.platform, (platformCounts.get(issue.platform) || 0) + 1)
    }
    const topPlatform = [...platformCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    return NextResponse.json({
      success: true,
      issues,
      stats: {
        totalIssues: issues.length,
        unresolvedCount,
        last24hCount,
        topPlatform,
      },
    })
  } catch (error) {
    console.error('Error fetching Sentry issues:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch errors',
      issues: [],
      stats: null,
    })
  }
}
