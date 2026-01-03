import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

interface AffiliateClickData {
  providerSlug: string
  providerName?: string
  linkType?: 'website' | 'phone' | 'plan'
  planId?: string
  planName?: string
  zipCode?: string
  pageUrl?: string
  referrer?: string
  userAgent?: string
  ipAddress?: string
  sessionId?: string
}

/**
 * Track an affiliate click
 */
export async function trackAffiliateClick(data: AffiliateClickData): Promise<void> {
  try {
    const supabase = createAdminClient()

    // Hash IP for privacy
    const ipHash = data.ipAddress
      ? crypto.createHash('sha256').update(data.ipAddress).digest('hex').slice(0, 16)
      : null

    await supabase.from('affiliate_clicks').insert({
      provider_slug: data.providerSlug,
      provider_name: data.providerName || null,
      link_type: data.linkType || 'website',
      plan_id: data.planId || null,
      plan_name: data.planName || null,
      zip_code: data.zipCode || null,
      page_url: data.pageUrl || null,
      referrer: data.referrer || null,
      user_agent: data.userAgent || null,
      ip_hash: ipHash,
      session_id: data.sessionId || null,
    })
  } catch (err) {
    console.error('[Affiliate Tracker] Error:', err)
  }
}

/**
 * Get affiliate analytics
 */
export async function getAffiliateAnalytics(days: number = 30): Promise<{
  totalClicks: number
  clicksByProvider: Array<{ provider: string; slug: string; clicks: number; estimatedRevenue: number }>
  clicksByType: Record<string, number>
  clicksOverTime: Array<{ date: string; clicks: number }>
  topZipCodes: Array<{ zip: string; clicks: number }>
  topPages: Array<{ page: string; clicks: number }>
  estimatedRevenue: number
}> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data: clicks, error } = await supabase
    .from('affiliate_clicks')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error || !clicks) {
    console.error('[Affiliate Analytics] Error:', error)
    return {
      totalClicks: 0,
      clicksByProvider: [],
      clicksByType: {},
      clicksOverTime: [],
      topZipCodes: [],
      topPages: [],
      estimatedRevenue: 0,
    }
  }

  // Provider revenue estimates (typical affiliate commissions)
  const revenuePerClick: Record<string, number> = {
    'att-internet': 0.50,
    'spectrum': 0.45,
    'xfinity': 0.40,
    'verizon-fios': 0.55,
    'frontier-fiber': 0.35,
    'google-fiber': 0.30,
    't-mobile-home-internet': 0.25,
    'cox': 0.40,
    'default': 0.30,
  }

  const totalClicks = clicks.length

  // Clicks by provider
  const providerCounts = new Map<string, { name: string; clicks: number }>()
  for (const click of clicks) {
    const existing = providerCounts.get(click.provider_slug) || { name: click.provider_name || click.provider_slug, clicks: 0 }
    existing.clicks++
    providerCounts.set(click.provider_slug, existing)
  }
  const clicksByProvider = [...providerCounts.entries()]
    .map(([slug, data]) => ({
      slug,
      provider: data.name,
      clicks: data.clicks,
      estimatedRevenue: data.clicks * (revenuePerClick[slug] || revenuePerClick.default),
    }))
    .sort((a, b) => b.clicks - a.clicks)

  // Clicks by type
  const clicksByType: Record<string, number> = {}
  for (const click of clicks) {
    const type = click.link_type || 'website'
    clicksByType[type] = (clicksByType[type] || 0) + 1
  }

  // Clicks over time
  const dateCounts = new Map<string, number>()
  for (const click of clicks) {
    const date = new Date(click.created_at).toISOString().split('T')[0]
    dateCounts.set(date, (dateCounts.get(date) || 0) + 1)
  }
  const clicksOverTime = [...dateCounts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, clicks]) => ({ date, clicks }))

  // Top ZIP codes
  const zipCounts = new Map<string, number>()
  for (const click of clicks) {
    if (click.zip_code) {
      zipCounts.set(click.zip_code, (zipCounts.get(click.zip_code) || 0) + 1)
    }
  }
  const topZipCodes = [...zipCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([zip, clicks]) => ({ zip, clicks }))

  // Top pages
  const pageCounts = new Map<string, number>()
  for (const click of clicks) {
    if (click.page_url) {
      const path = new URL(click.page_url, 'http://x').pathname
      pageCounts.set(path, (pageCounts.get(path) || 0) + 1)
    }
  }
  const topPages = [...pageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, clicks]) => ({ page, clicks }))

  // Total estimated revenue
  const estimatedRevenue = clicksByProvider.reduce((sum, p) => sum + p.estimatedRevenue, 0)

  return {
    totalClicks,
    clicksByProvider,
    clicksByType,
    clicksOverTime,
    topZipCodes,
    topPages,
    estimatedRevenue: Math.round(estimatedRevenue * 100) / 100,
  }
}

/**
 * Get recent affiliate clicks
 */
export async function getRecentAffiliateClicks(limit: number = 100): Promise<Array<{
  id: string
  providerSlug: string
  providerName: string | null
  linkType: string
  zipCode: string | null
  pageUrl: string | null
  createdAt: string
}>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('affiliate_clicks')
    .select('id, provider_slug, provider_name, link_type, zip_code, page_url, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('[Affiliate Clicks] Error:', error)
    return []
  }

  return data.map(c => ({
    id: c.id,
    providerSlug: c.provider_slug,
    providerName: c.provider_name,
    linkType: c.link_type,
    zipCode: c.zip_code,
    pageUrl: c.page_url,
    createdAt: c.created_at,
  }))
}
