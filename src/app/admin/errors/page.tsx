'use client'

import { useState, useEffect, useCallback } from 'react'

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

interface ErrorStats {
  totalIssues: number
  unresolvedCount: number
  last24hCount: number
  topPlatform: string
}

const SENTRY_ORG = 'funneleads'
const SENTRY_PROJECT = 'internetproviders-nextjs'
const SENTRY_ISSUES_URL = `https://sentry.io/organizations/${SENTRY_ORG}/issues/?project=${SENTRY_PROJECT}`

export default function ErrorsPage() {
  const [issues, setIssues] = useState<SentryIssue[]>([])
  const [stats, setStats] = useState<ErrorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set())

  const formatIssuesForCopy = useCallback((issuesToFormat: SentryIssue[]) => {
    if (issuesToFormat.length === 0) return ''

    const lines = issuesToFormat.map(issue => {
      return `## ${issue.shortId}: ${issue.title}
- **Location:** ${issue.culprit}
- **Level:** ${issue.level}
- **Events:** ${issue.count} | **Users:** ${issue.userCount}
- **Last seen:** ${new Date(issue.lastSeen).toLocaleString()}
- **Status:** ${issue.status}
- **Link:** https://sentry.io/organizations/${SENTRY_ORG}/issues/${issue.id}/`
    })

    return `# Sentry Errors (${issuesToFormat.length} issues)\n\n${lines.join('\n\n')}`
  }, [])

  const copyAllErrors = useCallback(async () => {
    const text = formatIssuesForCopy(issues)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [issues, formatIssuesForCopy])

  const copySelectedErrors = useCallback(async () => {
    const selected = issues.filter(i => selectedIssues.has(i.id))
    const text = formatIssuesForCopy(selected)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [issues, selectedIssues, formatIssuesForCopy])

  const toggleIssue = (id: string) => {
    setSelectedIssues(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    if (selectedIssues.size === issues.length) {
      setSelectedIssues(new Set())
    } else {
      setSelectedIssues(new Set(issues.map(i => i.id)))
    }
  }

  useEffect(() => {
    async function fetchErrors() {
      try {
        const res = await fetch('/api/admin/errors')
        const data = await res.json()

        if (data.success) {
          setIssues(data.issues)
          setStats(data.stats)
        } else {
          setError(data.error || 'Failed to fetch errors')
        }
      } catch (err) {
        console.error('Failed to fetch errors:', err)
        setError('Failed to connect to error tracking')
      } finally {
        setLoading(false)
      }
    }

    fetchErrors()
  }, [])

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Error Monitoring
          </h1>
          <p className="text-gray-400 mt-2">Track and resolve application errors from Sentry</p>
        </div>
        <div className="flex items-center gap-2">
          {issues.length > 0 && (
            <>
              {selectedIssues.size > 0 ? (
                <button
                  onClick={copySelectedErrors}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy {selectedIssues.size} Selected
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={copyAllErrors}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy All
                    </>
                  )}
                </button>
              )}
            </>
          )}
          <a
            href={SENTRY_ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Sentry
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-gray-900/60 rounded-xl p-8 border border-gray-700/50 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sentry API Not Configured</h3>
          <p className="text-gray-400 mb-4 max-w-md mx-auto">
            Add your Sentry Auth Token to the environment variables to enable error fetching.
          </p>
          <div className="text-sm text-gray-500 bg-gray-800 rounded-lg p-3 inline-block font-mono">
            SENTRY_AUTH_TOKEN=your_token_here
          </div>
          <div className="mt-6">
            <a
              href={SENTRY_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              View errors directly in Sentry →
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Total Issues</div>
              <div className="text-3xl font-bold text-white">{stats?.totalIssues || 0}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-red-500/30">
              <div className="text-sm text-gray-400 mb-1">Unresolved</div>
              <div className="text-3xl font-bold text-red-400">{stats?.unresolvedCount || 0}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-amber-500/30">
              <div className="text-sm text-gray-400 mb-1">Last 24 Hours</div>
              <div className="text-3xl font-bold text-amber-400">{stats?.last24hCount || 0}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Platform</div>
              <div className="text-2xl font-bold text-gray-300">{stats?.topPlatform || '-'}</div>
            </div>
          </div>

          {/* Issues Table */}
          <div className="bg-gray-900/60 rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Recent Issues</h3>
            </div>
            {issues.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left">
                      <th className="px-4 py-3 text-gray-400 font-medium w-10">
                        <input
                          type="checkbox"
                          checked={selectedIssues.size === issues.length && issues.length > 0}
                          onChange={selectAll}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-gray-400 font-medium">Issue</th>
                      <th className="px-4 py-3 text-gray-400 font-medium">Level</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-right">Events</th>
                      <th className="px-4 py-3 text-gray-400 font-medium text-right">Users</th>
                      <th className="px-4 py-3 text-gray-400 font-medium">Last Seen</th>
                      <th className="px-4 py-3 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr
                        key={issue.id}
                        className={`border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer ${
                          selectedIssues.has(issue.id) ? 'bg-cyan-500/10' : ''
                        }`}
                        onClick={() => toggleIssue(issue.id)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIssues.has(issue.id)}
                            onChange={() => toggleIssue(issue.id)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                          />
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`https://sentry.io/organizations/${SENTRY_ORG}/issues/${issue.id}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block hover:text-cyan-400 transition-colors"
                          >
                            <div className="font-medium text-white truncate max-w-md">{issue.title}</div>
                            <div className="text-xs text-gray-500 truncate">{issue.culprit}</div>
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs border ${getLevelColor(issue.level)}`}>
                            {issue.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">{issue.count}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{issue.userCount}</td>
                        <td className="px-4 py-3 text-gray-400">{formatTime(issue.lastSeen)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            issue.status === 'resolved'
                              ? 'bg-green-500/20 text-green-400'
                              : issue.status === 'ignored'
                              ? 'bg-gray-500/20 text-gray-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {issue.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-400">No errors found - your app is running smoothly!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
