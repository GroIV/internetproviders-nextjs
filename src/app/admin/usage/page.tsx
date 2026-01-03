'use client'

import { useState, useEffect, useCallback } from 'react'

interface UsageSummary {
  totalRequests: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCacheCreationTokens: number
  totalCacheReadTokens: number
  cacheHitRate: string
  estimatedCost: string
  savingsFromCache: string
  byEndpoint: Record<string, number>
  byModel: Record<string, number>
}

interface RecentRequest {
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
}

export default function UsagePage() {
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [hours, setHours] = useState(24)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/usage?hours=${hours}&detailed=true`)
      const data = await res.json()
      if (data.success) {
        setSummary(data.summary)
        setRecentRequests(data.recentRequests || [])
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    } finally {
      setLoading(false)
    }
  }, [hours])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchUsage, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchUsage])

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            API Usage
          </h1>
          <p className="text-gray-400 mt-2">Monitor token usage, costs, and AI model performance</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Time Range */}
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value={1}>Last 1 hour</option>
            <option value={6}>Last 6 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={72}>Last 3 days</option>
            <option value={168}>Last 7 days</option>
          </select>

          {/* Auto Refresh */}
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
            />
            Auto-refresh
          </label>

          {/* Manual Refresh */}
          <button
            onClick={fetchUsage}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Total Requests</div>
              <div className="text-3xl font-bold text-white">{summary?.totalRequests || 0}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-green-500/30">
              <div className="text-sm text-gray-400 mb-1">Estimated Cost</div>
              <div className="text-3xl font-bold text-green-400">{summary?.estimatedCost || '$0.00'}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-cyan-500/30">
              <div className="text-sm text-gray-400 mb-1">Cache Hit Rate</div>
              <div className="text-3xl font-bold text-cyan-400">{summary?.cacheHitRate || '0%'}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-purple-500/30">
              <div className="text-sm text-gray-400 mb-1">Savings from Cache</div>
              <div className="text-3xl font-bold text-purple-400">{summary?.savingsFromCache || '$0.00'}</div>
            </div>
          </div>

          {/* Token Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tokens Breakdown */}
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Token Usage</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Input Tokens</span>
                  <span className="text-white font-medium">{formatNumber(summary?.totalInputTokens || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Output Tokens</span>
                  <span className="text-white font-medium">{formatNumber(summary?.totalOutputTokens || 0)}</span>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Cache Created</span>
                    <span className="text-amber-400 font-medium">{formatNumber(summary?.totalCacheCreationTokens || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Cache Read</span>
                    <span className="text-green-400 font-medium">{formatNumber(summary?.totalCacheReadTokens || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Distribution */}
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Model Distribution</h3>
              {summary?.byModel && Object.keys(summary.byModel).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(summary.byModel).map(([model, count]) => {
                    const total = Object.values(summary.byModel).reduce((a, b) => a + b, 0)
                    const percentage = Math.round((count / total) * 100)
                    const isGPT = model.includes('gpt')

                    return (
                      <div key={model}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-400 truncate">{model}</span>
                          <span className="text-sm text-white font-medium ml-2">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isGPT ? 'bg-green-500' : 'bg-cyan-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No requests yet</p>
              )}
            </div>
          </div>

          {/* Recent Requests Table */}
          <div className="bg-gray-900/60 rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Recent Requests</h3>
            </div>
            {recentRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left">
                      <th className="px-4 py-3 text-gray-400 font-medium">Time</th>
                      <th className="px-4 py-3 text-gray-400 font-medium">Model</th>
                      <th className="px-4 py-3 text-gray-400 font-medium">ZIP</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-right">Input</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-right">Output</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-right">Cache</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((req, i) => {
                      const isGPT = req.model?.includes('gpt')
                      return (
                        <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="px-4 py-3 text-gray-300">{formatTime(req.created_at)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isGPT
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-cyan-500/20 text-cyan-400'
                            }`}>
                              {req.model?.replace('claude-3-5-', '').replace('-20241022', '') || 'unknown'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{req.zip_code || '-'}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{formatNumber(req.input_tokens)}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{formatNumber(req.output_tokens)}</td>
                          <td className="px-4 py-3 text-right">
                            {req.cache_read_tokens > 0 ? (
                              <span className="text-green-400">{formatNumber(req.cache_read_tokens)} read</span>
                            ) : req.cache_creation_tokens > 0 ? (
                              <span className="text-amber-400">{formatNumber(req.cache_creation_tokens)} created</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-white font-medium">${req.estimated_cost.toFixed(4)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No requests in this time period</div>
            )}
          </div>

          {/* Pricing Reference */}
          <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Pricing Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">GPT-4o-mini (Primary)</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Input: $0.15 / 1M tokens</p>
                  <p>Output: $0.60 / 1M tokens</p>
                  <p>Cached: $0.075 / 1M tokens (50% off)</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-cyan-400 mb-2">Claude 3.5 Haiku (Fallback)</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Input: $0.80 / 1M tokens</p>
                  <p>Output: $4.00 / 1M tokens</p>
                  <p>Cache write: $1.00 / 1M tokens</p>
                  <p>Cache read: $0.08 / 1M tokens (90% off)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
