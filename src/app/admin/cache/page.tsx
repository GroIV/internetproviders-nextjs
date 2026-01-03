'use client'

import { useState, useEffect } from 'react'

interface CacheEntry {
  key: string
  type: string
  ttl: number
}

interface CacheStats {
  totalKeys: number
  chatCacheKeys: number
  rateLimitKeys: number
  otherKeys: number
  dbSize: number
}

interface CacheData {
  stats: CacheStats
  entries: CacheEntry[]
}

export default function CacheManagementPage() {
  const [data, setData] = useState<CacheData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'chat' | 'ratelimit' | 'other'>('all')
  const [deleting, setDeleting] = useState(false)
  const [viewingKey, setViewingKey] = useState<string | null>(null)
  const [keyValue, setKeyValue] = useState<unknown>(null)

  useEffect(() => {
    fetchCache()
  }, [])

  async function fetchCache() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/cache')
      const json = await res.json()
      if (json.success) {
        setData(json)
      } else {
        setError(json.error || 'Failed to fetch cache')
      }
    } catch {
      setError('Failed to fetch cache data')
    } finally {
      setLoading(false)
    }
  }

  async function viewKey(key: string) {
    setViewingKey(key)
    try {
      const res = await fetch(`/api/admin/cache?key=${encodeURIComponent(key)}`)
      const json = await res.json()
      if (json.success) {
        setKeyValue(json.value)
      }
    } catch {
      setKeyValue(null)
    }
  }

  async function deleteSelected() {
    if (selectedKeys.size === 0) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/cache', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: Array.from(selectedKeys) }),
      })
      const json = await res.json()
      if (json.success) {
        setSelectedKeys(new Set())
        fetchCache()
      }
    } catch {
      setError('Failed to delete cache entries')
    } finally {
      setDeleting(false)
    }
  }

  async function clearByPattern(pattern: string) {
    if (!confirm(`Delete all keys matching "${pattern}"?`)) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/cache', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern }),
      })
      const json = await res.json()
      if (json.success) {
        alert(`Deleted ${json.deletedCount} keys`)
        fetchCache()
      }
    } catch {
      setError('Failed to clear cache')
    } finally {
      setDeleting(false)
    }
  }

  const filteredEntries = data?.entries.filter(e => {
    if (filter === 'all') return true
    return e.type === filter
  }) || []

  const toggleKey = (key: string) => {
    const newSet = new Set(selectedKeys)
    if (newSet.has(key)) {
      newSet.delete(key)
    } else {
      newSet.add(key)
    }
    setSelectedKeys(newSet)
  }

  const formatTTL = (ttl: number) => {
    if (ttl === -1) return 'No expiry'
    if (ttl === -2) return 'Expired'
    if (ttl < 60) return `${ttl}s`
    if (ttl < 3600) return `${Math.floor(ttl / 60)}m`
    if (ttl < 86400) return `${Math.floor(ttl / 3600)}h`
    return `${Math.floor(ttl / 86400)}d`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Cache Management
          </h1>
          <p className="text-gray-400 mt-2">View and manage Redis cache entries</p>
        </div>
        <button
          onClick={fetchCache}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50 animate-pulse">
              <div className="h-4 w-24 bg-gray-800 rounded mb-4" />
              <div className="h-8 w-16 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Total Keys</div>
              <div className="text-3xl font-bold text-white">{data.stats.totalKeys}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Chat Cache</div>
              <div className="text-3xl font-bold text-cyan-400">{data.stats.chatCacheKeys}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Rate Limit</div>
              <div className="text-3xl font-bold text-yellow-400">{data.stats.rateLimitKeys}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">DB Size</div>
              <div className="text-3xl font-bold text-purple-400">{data.stats.dbSize}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => clearByPattern('chat:*')}
                disabled={deleting}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                Clear All Chat Cache
              </button>
              <button
                onClick={() => clearByPattern('ratelimit:*')}
                disabled={deleting}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                Clear Rate Limits
              </button>
              {selectedKeys.size > 0 && (
                <button
                  onClick={deleteSelected}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-colors disabled:opacity-50"
                >
                  Delete Selected ({selectedKeys.size})
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'chat', 'ratelimit', 'other'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && ` (${data.entries.filter(e => e.type === f).length})`}
              </button>
            ))}
          </div>

          {/* Cache Entries Table */}
          <div className="bg-gray-900/60 rounded-xl border border-gray-700/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-gray-400 w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedKeys(new Set(filteredEntries.map(e => e.key)))
                        } else {
                          setSelectedKeys(new Set())
                        }
                      }}
                      checked={selectedKeys.size === filteredEntries.length && filteredEntries.length > 0}
                      className="rounded bg-gray-700 border-gray-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Key</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Type</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">TTL</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredEntries.map((entry) => (
                  <tr key={entry.key} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedKeys.has(entry.key)}
                        onChange={() => toggleKey(entry.key)}
                        className="rounded bg-gray-700 border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-300 max-w-md truncate">
                      {entry.key}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        entry.type === 'chat' ? 'bg-cyan-500/20 text-cyan-300' :
                        entry.type === 'ratelimit' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatTTL(entry.ttl)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => viewKey(entry.key)}
                        className="text-sm text-purple-400 hover:text-purple-300"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEntries.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No cache entries found
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* View Key Modal */}
      {viewingKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-white truncate">{viewingKey}</h3>
              <button
                onClick={() => { setViewingKey(null); setKeyValue(null) }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[60vh]">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-800 p-4 rounded-lg">
                {keyValue ? JSON.stringify(keyValue, null, 2) : 'Loading...'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
