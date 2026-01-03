'use client'

import { useState, useEffect, useCallback } from 'react'

interface ChatLog {
  id: string
  created_at: string
  model: string | null
  zip_code: string | null
  message_count: number
  input_tokens: number
  output_tokens: number
  response_time_ms: number | null
  error: string | null
  estimated_cost: number
}

export default function ChatsPage() {
  const [chats, setChats] = useState<ChatLog[]>([])
  const [loading, setLoading] = useState(true)
  const [hours, setHours] = useState(24)
  const [stats, setStats] = useState({
    totalChats: 0,
    avgMessages: 0,
    avgResponseTime: 0,
    errorRate: 0,
    topZips: [] as { zip: string; count: number }[],
  })

  const fetchChats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/chats?hours=${hours}`)
      const data = await res.json()
      if (data.success) {
        setChats(data.chats)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error)
    } finally {
      setLoading(false)
    }
  }, [hours])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Chat Logs
          </h1>
          <p className="text-gray-400 mt-2">Monitor AI chat conversations and usage patterns</p>
        </div>
        <div className="flex items-center gap-4">
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
          <button
            onClick={fetchChats}
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
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Total Chats</div>
              <div className="text-3xl font-bold text-white">{stats.totalChats}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Avg Messages</div>
              <div className="text-3xl font-bold text-cyan-400">{stats.avgMessages.toFixed(1)}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Avg Response</div>
              <div className="text-3xl font-bold text-blue-400">{stats.avgResponseTime > 0 ? `${(stats.avgResponseTime / 1000).toFixed(1)}s` : '-'}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Error Rate</div>
              <div className={`text-3xl font-bold ${stats.errorRate > 5 ? 'text-red-400' : 'text-green-400'}`}>
                {stats.errorRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Top ZIP</div>
              <div className="text-2xl font-bold text-purple-400">
                {stats.topZips[0]?.zip || '-'}
              </div>
              {stats.topZips[0] && (
                <div className="text-xs text-gray-500">{stats.topZips[0].count} chats</div>
              )}
            </div>
          </div>

          {/* Top ZIP Codes */}
          {stats.topZips.length > 1 && (
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Top ZIP Codes</h3>
              <div className="flex flex-wrap gap-2">
                {stats.topZips.slice(0, 10).map((item) => (
                  <span
                    key={item.zip}
                    className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm"
                  >
                    <span className="text-cyan-400 font-mono">{item.zip}</span>
                    <span className="text-gray-500 ml-2">({item.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Chat Logs Table */}
          <div className="bg-gray-900/60 rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Recent Conversations</h3>
            </div>
            {chats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left">
                      <th className="px-4 py-3 text-gray-400 font-medium">Time</th>
                      <th className="px-4 py-3 text-gray-400 font-medium">Model</th>
                      <th className="px-4 py-3 text-gray-400 font-medium">ZIP</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-right">Messages</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-right">Tokens</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-right">Response</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-right">Cost</th>
                      <th className="px-4 py-3 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chats.map((chat) => {
                      const isGPT = chat.model?.includes('gpt')
                      const totalTokens = chat.input_tokens + chat.output_tokens
                      return (
                        <tr key={chat.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="px-4 py-3 text-gray-300">{formatTime(chat.created_at)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isGPT
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-cyan-500/20 text-cyan-400'
                            }`}>
                              {chat.model?.replace('gpt-4o-', '').replace('claude-3-5-', '').replace('-20241022', '') || 'unknown'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {chat.zip_code ? (
                              <span className="font-mono text-cyan-400">{chat.zip_code}</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-300">{chat.message_count}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{totalTokens.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-gray-300">
                            {chat.response_time_ms ? `${(chat.response_time_ms / 1000).toFixed(1)}s` : '-'}
                          </td>
                          <td className="px-4 py-3 text-right text-white font-medium">
                            ${chat.estimated_cost.toFixed(4)}
                          </td>
                          <td className="px-4 py-3">
                            {chat.error ? (
                              <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Error</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">OK</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No chat logs in this time period</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
