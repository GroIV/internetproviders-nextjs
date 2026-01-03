'use client'

import { useState, useEffect } from 'react'

interface AffiliateAnalytics {
  totalClicks: number
  clicksByProvider: Array<{ provider: string; slug: string; clicks: number; estimatedRevenue: number }>
  clicksByType: Record<string, number>
  clicksOverTime: Array<{ date: string; clicks: number }>
  topZipCodes: Array<{ zip: string; clicks: number }>
  topPages: Array<{ page: string; clicks: number }>
  estimatedRevenue: number
}

interface RecentClick {
  id: string
  providerSlug: string
  providerName: string | null
  linkType: string
  zipCode: string | null
  pageUrl: string | null
  createdAt: string
}

export default function AffiliatePage() {
  const [analytics, setAnalytics] = useState<AffiliateAnalytics | null>(null)
  const [recentClicks, setRecentClicks] = useState<RecentClick[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [view, setView] = useState<'overview' | 'clicks'>('overview')

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  async function fetchData() {
    setLoading(true)
    try {
      const [analyticsRes, clicksRes] = await Promise.all([
        fetch(`/api/admin/affiliate?days=${days}`),
        fetch('/api/admin/affiliate?recent=true&limit=100'),
      ])

      const analyticsData = await analyticsRes.json()
      const clicksData = await clicksRes.json()

      if (analyticsData.success) setAnalytics(analyticsData.analytics)
      if (clicksData.success) setRecentClicks(clicksData.clicks)
    } catch (error) {
      console.error('Failed to fetch affiliate data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Affiliate Performance
          </h1>
          <p className="text-gray-400 mt-2">Track clicks, conversions, and estimated revenue</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('overview')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'overview' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setView('clicks')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'clicks' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Recent Clicks ({recentClicks.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50 animate-pulse">
              <div className="h-4 w-24 bg-gray-800 rounded mb-4" />
              <div className="h-8 w-16 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : view === 'overview' ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Total Clicks</div>
              <div className="text-3xl font-bold text-white">{analytics?.totalClicks || 0}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Estimated Revenue</div>
              <div className="text-3xl font-bold text-green-400">${analytics?.estimatedRevenue.toFixed(2) || '0.00'}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Avg Revenue/Click</div>
              <div className="text-3xl font-bold text-emerald-400">
                ${analytics?.totalClicks ? (analytics.estimatedRevenue / analytics.totalClicks).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>

          {/* Click Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Clicks by Type</h3>
              <div className="space-y-3">
                {Object.entries(analytics?.clicksByType || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(count / (analytics?.totalClicks || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(analytics?.clicksByType || {}).length === 0 && (
                  <div className="text-gray-500 text-sm">No click data yet</div>
                )}
              </div>
            </div>

            {/* Clicks Over Time */}
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Clicks Over Time</h3>
              <div className="h-40 flex items-end gap-1">
                {analytics?.clicksOverTime.map((day, i) => {
                  const max = Math.max(...(analytics?.clicksOverTime.map(d => d.clicks) || [1]))
                  const height = (day.clicks / max) * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${height}%`, minHeight: day.clicks > 0 ? '4px' : '0' }}
                        title={`${day.date}: ${day.clicks} clicks`}
                      />
                    </div>
                  )
                })}
                {(!analytics?.clicksOverTime.length) && (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    No click data yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Provider Performance */}
          <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Provider Performance</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400">
                  <th className="pb-3">Provider</th>
                  <th className="pb-3 text-right">Clicks</th>
                  <th className="pb-3 text-right">Est. Revenue</th>
                  <th className="pb-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {analytics?.clicksByProvider.map((p) => (
                  <tr key={p.slug}>
                    <td className="py-3 text-gray-300">{p.provider}</td>
                    <td className="py-3 text-right text-gray-300">{p.clicks}</td>
                    <td className="py-3 text-right text-green-400">${p.estimatedRevenue.toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(p.clicks / (analytics?.totalClicks || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400 w-10">
                          {Math.round((p.clicks / (analytics?.totalClicks || 1)) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!analytics?.clicksByProvider.length) && (
              <div className="text-center text-gray-500 py-8">No provider clicks yet</div>
            )}
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top ZIP Codes */}
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Top ZIP Codes</h3>
              <div className="space-y-2">
                {analytics?.topZipCodes.map((z) => (
                  <div key={z.zip} className="flex items-center justify-between">
                    <span className="text-gray-300 font-mono">{z.zip}</span>
                    <span className="text-sm text-gray-400">{z.clicks} clicks</span>
                  </div>
                ))}
                {(!analytics?.topZipCodes.length) && (
                  <div className="text-gray-500 text-sm">No ZIP data yet</div>
                )}
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Top Pages</h3>
              <div className="space-y-2">
                {analytics?.topPages.map((p) => (
                  <div key={p.page} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm truncate max-w-[200px]">{p.page}</span>
                    <span className="text-sm text-gray-400">{p.clicks} clicks</span>
                  </div>
                ))}
                {(!analytics?.topPages.length) && (
                  <div className="text-gray-500 text-sm">No page data yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Recent Clicks View */
        <div className="bg-gray-900/60 rounded-xl border border-gray-700/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Time</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Provider</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">ZIP</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentClicks.map((click) => (
                <tr key={click.id} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(click.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {click.providerName || click.providerSlug}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      click.linkType === 'plan' ? 'bg-green-500/20 text-green-300' :
                      click.linkType === 'phone' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {click.linkType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-cyan-400">
                    {click.zipCode || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                    {click.pageUrl ? new URL(click.pageUrl, 'http://x').pathname : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentClicks.length === 0 && (
            <div className="p-8 text-center text-gray-500">No clicks recorded yet</div>
          )}
        </div>
      )}
    </div>
  )
}
