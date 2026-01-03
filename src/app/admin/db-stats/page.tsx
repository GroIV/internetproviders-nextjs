'use client'

import { useState, useEffect } from 'react'

interface TableStats {
  name: string
  rowCount: number
  estimatedSize: string
}

interface RecentActivity {
  table: string
  action: string
  count: number
  period: string
}

interface DbStats {
  tables: TableStats[]
  totalRows: number
  totalTables: number
  recentActivity: RecentActivity[]
}

export default function DbStatsPage() {
  const [stats, setStats] = useState<DbStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/db-stats')
      const data = await res.json()
      if (data.success) setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch db stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTableIcon = (name: string) => {
    if (name.includes('provider')) return '🏢'
    if (name.includes('plan')) return '📋'
    if (name.includes('guide')) return '📖'
    if (name.includes('api') || name.includes('usage')) return '📊'
    if (name.includes('chat')) return '💬'
    if (name.includes('affiliate') || name.includes('click')) return '🔗'
    if (name.includes('zip') || name.includes('cbsa')) return '📍'
    if (name.includes('update')) return '🔄'
    return '📁'
  }

  const getTableCategory = (name: string) => {
    if (name.includes('provider') || name.includes('plan') || name.includes('fcc')) return 'Core Data'
    if (name.includes('guide')) return 'Content'
    if (name.includes('api') || name.includes('chat') || name.includes('affiliate')) return 'Analytics'
    if (name.includes('zip') || name.includes('cbsa')) return 'Coverage'
    if (name.includes('update')) return 'Admin'
    return 'Other'
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Database Stats
          </h1>
          <p className="text-gray-400 mt-2">Monitor table sizes, row counts, and database activity</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50 animate-pulse">
              <div className="h-4 w-24 bg-gray-800 rounded mb-4" />
              <div className="h-8 w-16 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Total Tables</div>
              <div className="text-3xl font-bold text-white">{stats?.totalTables || 0}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Total Rows</div>
              <div className="text-3xl font-bold text-white">
                {(stats?.totalRows || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Recent Activity (24h)</div>
              <div className="text-3xl font-bold text-orange-400">
                {stats?.recentActivity.filter(a => a.period === '24h').reduce((sum, a) => sum + a.count, 0).toLocaleString() || 0}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats?.recentActivity.map((activity, i) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getTableIcon(activity.table)}</span>
                    <span className="text-sm text-gray-400">{activity.table}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{activity.count.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{activity.action} ({activity.period})</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tables by Category */}
          {['Core Data', 'Coverage', 'Analytics', 'Content', 'Admin'].map(category => {
            const categoryTables = stats?.tables.filter(t => getTableCategory(t.name) === category) || []
            if (categoryTables.length === 0) return null

            return (
              <div key={category} className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">{category}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400">
                        <th className="pb-3">Table</th>
                        <th className="pb-3 text-right">Rows</th>
                        <th className="pb-3 text-right">Est. Size</th>
                        <th className="pb-3 text-right">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {categoryTables.map((table) => (
                        <tr key={table.name}>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span>{getTableIcon(table.name)}</span>
                              <span className="text-gray-300 font-mono text-sm">{table.name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-right text-white font-mono">
                            {table.rowCount.toLocaleString()}
                          </td>
                          <td className="py-3 text-right text-gray-400">
                            {table.estimatedSize}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500 rounded-full"
                                  style={{ width: `${Math.min((table.rowCount / (stats?.totalRows || 1)) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-400 w-12">
                                {((table.rowCount / (stats?.totalRows || 1)) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}

          {/* Supabase Link */}
          <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">Database Management</h3>
            <p className="text-gray-400 text-sm mb-4">
              For advanced database operations, schema changes, and SQL queries, use the Supabase dashboard.
            </p>
            <a
              href="https://supabase.com/dashboard/project/aogfhlompvfztymxrxfm/editor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 109 113" fill="currentColor">
                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" />
                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fillOpacity="0.2" />
                <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" />
              </svg>
              Open Supabase Dashboard
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
