'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface UsageSummary {
  totalRequests: number
  totalInputTokens: number
  totalOutputTokens: number
  estimatedCost: string
  byModel: Record<string, number>
}

interface UpdatesStats {
  total: number
  pending: number
  dueSoon: number
}

export default function AdminDashboard() {
  const [usage, setUsage] = useState<UsageSummary | null>(null)
  const [updates, setUpdates] = useState<UpdatesStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch usage stats
        const usageRes = await fetch('/api/admin/usage?hours=24')
        const usageData = await usageRes.json()
        if (usageData.success) {
          setUsage(usageData.summary)
        }

        // Fetch updates stats
        const updatesRes = await fetch('/api/admin/updates')
        const updatesData = await updatesRes.json()
        if (updatesData.success) {
          setUpdates(updatesData.stats)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Overview of your InternetProviders.ai platform</p>
      </div>

      <div className="space-y-8">
        {loading ? (
          <>
            {/* Skeleton Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-800" />
                    <div className="w-12 h-3 bg-gray-800 rounded" />
                  </div>
                  <div className="h-9 w-20 bg-gray-800 rounded mb-1" />
                  <div className="h-4 w-24 bg-gray-800 rounded" />
                </div>
              ))}
            </div>
            {/* Skeleton Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-800" />
                    <div className="flex-1">
                      <div className="h-5 w-24 bg-gray-800 rounded mb-2" />
                      <div className="h-4 w-48 bg-gray-800 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* API Requests */}
              <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">Last 24h</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{usage?.totalRequests || 0}</div>
                <div className="text-sm text-gray-400">API Requests</div>
              </div>

              {/* Estimated Cost */}
              <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">Last 24h</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{usage?.estimatedCost || '$0.00'}</div>
                <div className="text-sm text-gray-400">API Cost</div>
              </div>

              {/* Pending Updates */}
              <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">Active</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{updates?.pending || 0}</div>
                <div className="text-sm text-gray-400">Pending Updates</div>
              </div>

              {/* Due Updates */}
              <div className="bg-gray-900/60 rounded-xl p-6 border border-red-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">Action needed</span>
                </div>
                <div className="text-3xl font-bold text-red-400 mb-1">{updates?.dueSoon || 0}</div>
                <div className="text-sm text-gray-400">Due/Overdue</div>
              </div>
            </div>

            {/* Model Usage */}
            {usage?.byModel && Object.keys(usage.byModel).length > 0 && (
              <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Model Usage (24h)</h3>
                <div className="space-y-3">
                  {Object.entries(usage.byModel).map(([model, count]) => {
                    const total = Object.values(usage.byModel).reduce((a, b) => a + b, 0)
                    const percentage = Math.round((count / total) * 100)
                    const isGPT = model.includes('gpt')

                    return (
                      <div key={model}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-400">{model}</span>
                          <span className="text-sm text-white font-medium">{count} requests ({percentage}%)</span>
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
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API Usage Card */}
              <Link
                href="/admin/usage"
                className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">API Usage</h3>
                    <p className="text-sm text-gray-400">Monitor token usage, costs, and model performance</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Updates Card */}
              <Link
                href="/admin/updates"
                className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">Provider Updates</h3>
                    <p className="text-sm text-gray-400">Track pricing changes and scheduled database updates</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
