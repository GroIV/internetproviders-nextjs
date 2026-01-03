'use client'

import { useState, useEffect } from 'react'

interface ChatAnalytics {
  totalSessions: number
  totalMessages: number
  avgMessagesPerSession: number
  topZipCodes: Array<{ zip: string; count: number }>
  topProviders: Array<{ provider: string; count: number }>
  popularQuestions: Array<{ question: string; count: number }>
  sessionsOverTime: Array<{ date: string; count: number }>
  totalCost: number
}

interface ChatSession {
  id: string
  sessionId: string
  zipCode: string | null
  messageCount: number
  firstMessage: string | null
  providersDiscussed: string[]
  totalCost: number
  createdAt: string
}

interface SessionDetail {
  id: string
  sessionId: string
  zipCode: string | null
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  messageCount: number
  providersDiscussed: string[]
  model: string | null
  totalInputTokens: number
  totalOutputTokens: number
  totalCost: number
  createdAt: string
}

export default function ChatAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)
  const [view, setView] = useState<'analytics' | 'sessions'>('analytics')

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  async function fetchData() {
    setLoading(true)
    try {
      const [analyticsRes, sessionsRes] = await Promise.all([
        fetch(`/api/admin/chat-analytics?days=${days}`),
        fetch('/api/admin/chat-analytics?recent=true&limit=100'),
      ])

      const analyticsData = await analyticsRes.json()
      const sessionsData = await sessionsRes.json()

      if (analyticsData.success) setAnalytics(analyticsData.analytics)
      if (sessionsData.success) setSessions(sessionsData.sessions)
    } catch (error) {
      console.error('Failed to fetch chat analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  async function viewSession(id: string) {
    try {
      const res = await fetch(`/api/admin/chat-analytics?sessionId=${id}`)
      const data = await res.json()
      if (data.success) setSelectedSession(data.session)
    } catch (error) {
      console.error('Failed to fetch session:', error)
    }
  }

  function exportCSV() {
    if (!sessions.length) return

    const headers = ['Date', 'Session ID', 'ZIP Code', 'Messages', 'First Question', 'Providers', 'Cost']
    const rows = sessions.map(s => [
      new Date(s.createdAt).toLocaleString(),
      s.sessionId,
      s.zipCode || '',
      s.messageCount,
      (s.firstMessage || '').replace(/,/g, ';').slice(0, 100),
      s.providersDiscussed.join('; '),
      `$${s.totalCost.toFixed(4)}`,
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-sessions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Chat Analytics
          </h1>
          <p className="text-gray-400 mt-2">Analyze AI chat conversations and user behavior</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('analytics')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'analytics' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setView('sessions')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'sessions' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Sessions ({sessions.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50 animate-pulse">
              <div className="h-4 w-24 bg-gray-800 rounded mb-4" />
              <div className="h-8 w-16 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : view === 'analytics' ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Total Sessions</div>
              <div className="text-3xl font-bold text-white">{analytics?.totalSessions || 0}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Total Messages</div>
              <div className="text-3xl font-bold text-white">{analytics?.totalMessages || 0}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Avg Messages/Session</div>
              <div className="text-3xl font-bold text-white">{analytics?.avgMessagesPerSession || 0}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Total Cost</div>
              <div className="text-3xl font-bold text-green-400">${analytics?.totalCost.toFixed(2) || '0.00'}</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessions Over Time */}
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Sessions Over Time</h3>
              <div className="h-48 flex items-end gap-1">
                {analytics?.sessionsOverTime.map((day, i) => {
                  const max = Math.max(...(analytics?.sessionsOverTime.map(d => d.count) || [1]))
                  const height = (day.count / max) * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-purple-500 rounded-t"
                        style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                        title={`${day.date}: ${day.count} sessions`}
                      />
                      <div className="text-[10px] text-gray-500 mt-1 rotate-45 origin-left">
                        {day.date.slice(5)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top ZIP Codes */}
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Top ZIP Codes</h3>
              <div className="space-y-3">
                {analytics?.topZipCodes.slice(0, 5).map((zip) => (
                  <div key={zip.zip} className="flex items-center justify-between">
                    <span className="text-gray-300 font-mono">{zip.zip}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${(zip.count / (analytics?.topZipCodes[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-8">{zip.count}</span>
                    </div>
                  </div>
                ))}
                {(!analytics?.topZipCodes.length) && (
                  <div className="text-gray-500 text-sm">No ZIP code data yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Providers */}
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Providers Discussed</h3>
              <div className="flex flex-wrap gap-2">
                {analytics?.topProviders.map((p) => (
                  <span
                    key={p.provider}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                  >
                    {p.provider} ({p.count})
                  </span>
                ))}
                {(!analytics?.topProviders.length) && (
                  <div className="text-gray-500 text-sm">No provider data yet</div>
                )}
              </div>
            </div>

            {/* Popular Questions */}
            <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Popular Questions</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {analytics?.popularQuestions.slice(0, 10).map((q, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-purple-400 font-mono">{q.count}x</span>
                    <span className="text-gray-300 line-clamp-2">{q.question}</span>
                  </div>
                ))}
                {(!analytics?.popularQuestions.length) && (
                  <div className="text-gray-500 text-sm">No questions yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sessions List View */
        <div className="bg-gray-900/60 rounded-xl border border-gray-700/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">ZIP</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Messages</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">First Question</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400">Providers</th>
                <th className="px-4 py-3 text-right text-sm text-gray-400">Cost</th>
                <th className="px-4 py-3 text-right text-sm text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(session.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-cyan-400">
                    {session.zipCode || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{session.messageCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                    {session.firstMessage || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {session.providersDiscussed.slice(0, 3).map(p => (
                      <span key={p} className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs mr-1">
                        {p}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-400 text-right">
                    ${session.totalCost.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => viewSession(session.id)}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessions.length === 0 && (
            <div className="p-8 text-center text-gray-500">No chat sessions recorded yet</div>
          )}
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Chat Session</h3>
                <p className="text-sm text-gray-400">
                  {new Date(selectedSession.createdAt).toLocaleString()} | ZIP: {selectedSession.zipCode || 'N/A'} |
                  Model: {selectedSession.model || 'N/A'} | Cost: ${selectedSession.totalCost.toFixed(4)}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
              {selectedSession.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                      : 'bg-gray-800 border border-gray-700'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1 uppercase">{msg.role}</div>
                  <div className="text-gray-200 whitespace-pre-wrap text-sm">{msg.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
