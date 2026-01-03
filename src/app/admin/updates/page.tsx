'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface ScheduledUpdate {
  id: number
  provider_slug: string
  provider_name: string
  effective_date: string
  category: string
  change_type: string
  title: string
  description: string | null
  affected_table: string | null
  field_to_update: string | null
  old_value: string | null
  new_value: string | null
  sql_to_execute: string | null
  source_file: string | null
  source_notes: string | null
  status: 'pending' | 'applied' | 'skipped' | 'expired'
  applied_at: string | null
  created_at: string
}

interface AuditLogEntry {
  id: number
  update_id: number | null
  update_title: string
  action: string
  action_by: string
  details: Record<string, unknown> | null
  created_at: string
}

interface DryRunResult {
  success: boolean
  estimatedRows?: number
  currentValues?: Array<{
    id: number
    plan: string
    provider: string
    type: string
    currentPrice: number
    field: string
  }>
  error?: string
}

interface Stats {
  total: number
  pending: number
  dueSoon: number
  upcomingThisMonth: number
}

const categoryColors: Record<string, string> = {
  pricing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  product: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  promotion: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  discontinuation: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const changeTypeLabels: Record<string, string> = {
  price_increase: 'Price Increase',
  price_decrease: 'Price Decrease',
  new_product: 'New Product',
  end_promo: 'Promo Ending',
  feature_change: 'Feature Change',
}

const actionLabels: Record<string, { label: string; color: string }> = {
  applied: { label: 'Applied', color: 'text-green-400' },
  skipped: { label: 'Skipped', color: 'text-gray-400' },
  reopened: { label: 'Reopened', color: 'text-blue-400' },
  deleted: { label: 'Deleted', color: 'text-red-400' },
  sql_executed: { label: 'SQL Executed', color: 'text-amber-400' },
  sql_execute_failed: { label: 'SQL Failed', color: 'text-red-400' },
  dry_run: { label: 'Dry Run', color: 'text-cyan-400' },
  created: { label: 'Created', color: 'text-green-400' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Calendar Component
function CalendarView({
  updates,
  currentMonth,
  onMonthChange,
  onSelectDate,
}: {
  updates: ScheduledUpdate[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
  onSelectDate: (date: string) => void
}) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const days: (number | null)[] = []
  for (let i = 0; i < startPadding; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const updatesByDate: Record<string, ScheduledUpdate[]> = {}
  for (const update of updates) {
    const date = update.effective_date
    if (!updatesByDate[date]) updatesByDate[date] = []
    updatesByDate[date].push(update)
  }

  const prevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1))
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-white">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs text-gray-500 py-1">{day}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={i} className="h-12" />
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayUpdates = updatesByDate[dateStr] || []
          const isToday = dateStr === today
          const hasPending = dayUpdates.some(u => u.status === 'pending')
          const hasApplied = dayUpdates.some(u => u.status === 'applied')

          return (
            <button
              key={i}
              onClick={() => dayUpdates.length > 0 && onSelectDate(dateStr)}
              disabled={dayUpdates.length === 0}
              className={`h-12 rounded-lg relative flex flex-col items-center justify-start pt-1 transition-colors ${
                isToday ? 'bg-cyan-600/20 border border-cyan-500/50' :
                dayUpdates.length > 0 ? 'bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer' :
                'text-gray-600'
              }`}
            >
              <span className={`text-sm ${isToday ? 'text-cyan-400 font-bold' : ''}`}>{day}</span>
              {dayUpdates.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {hasPending && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  {hasApplied && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                </div>
              )}
              {dayUpdates.length > 1 && (
                <span className="absolute bottom-0.5 text-[10px] text-gray-500">+{dayUpdates.length}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Audit Log Panel
function AuditLogPanel({ auditLog }: { auditLog: AuditLogEntry[] }) {
  if (!auditLog || auditLog.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No activity recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {auditLog.map(entry => {
        const actionInfo = actionLabels[entry.action] || { label: entry.action, color: 'text-gray-400' }
        return (
          <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
            <div className={`mt-0.5 ${actionInfo.color}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${actionInfo.color}`}>{actionInfo.label}</span>
                <span className="text-xs text-gray-500">{formatDateTime(entry.created_at)}</span>
              </div>
              <p className="text-sm text-gray-400 truncate">{entry.update_title}</p>
              {entry.details && Object.keys(entry.details).length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {JSON.stringify(entry.details)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Dry Run Preview Modal
function DryRunModal({
  isOpen,
  onClose,
  update,
  dryRunResult,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  update: ScheduledUpdate | null
  dryRunResult: DryRunResult | null
  isLoading: boolean
}) {
  if (!isOpen || !update) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">SQL Preview: {update.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* SQL */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">SQL Statement</h4>
            <pre className="p-3 bg-gray-800 rounded-lg text-xs text-gray-300 overflow-x-auto">
              {update.sql_to_execute}
            </pre>
          </div>

          {/* Dry Run Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
              <span className="ml-2 text-gray-400">Analyzing...</span>
            </div>
          ) : dryRunResult ? (
            <>
              {dryRunResult.error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{dryRunResult.error}</p>
                </div>
              )}

              {dryRunResult.estimatedRows !== undefined && (
                <div className="mb-4 p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                  <p className="text-sm text-cyan-400">
                    <span className="font-bold">{dryRunResult.estimatedRows}</span> rows will be affected
                  </p>
                </div>
              )}

              {dryRunResult.currentValues && dryRunResult.currentValues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Current Values (up to 10 shown)</h4>
                  <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-2 text-gray-400">ID</th>
                          <th className="text-left p-2 text-gray-400">Plan</th>
                          <th className="text-left p-2 text-gray-400">Provider</th>
                          <th className="text-left p-2 text-gray-400">Current</th>
                          <th className="text-left p-2 text-gray-400">New</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dryRunResult.currentValues.map(row => (
                          <tr key={row.id} className="border-b border-gray-700/50">
                            <td className="p-2 text-gray-500">{row.id}</td>
                            <td className="p-2 text-white">{row.plan}</td>
                            <td className="p-2 text-gray-400">{row.provider}</td>
                            <td className="p-2 text-red-400">${row.currentPrice}</td>
                            <td className="p-2 text-green-400">{update.new_value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">Click &quot;Run Preview&quot; to see affected rows</p>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function UpdateCard({
  update,
  onAction,
  onExecuteSQL,
  onDryRun,
}: {
  update: ScheduledUpdate
  onAction: (id: number, action: 'apply' | 'skip' | 'reopen' | 'delete') => void
  onExecuteSQL: (id: number, sql: string) => Promise<void>
  onDryRun: (update: ScheduledUpdate) => void
}) {
  const [copied, setCopied] = useState(false)
  const [executing, setExecuting] = useState(false)
  const daysUntil = getDaysUntil(update.effective_date)
  const isDue = daysUntil <= 0
  const isDueSoon = daysUntil > 0 && daysUntil <= 7

  const handleCopySQL = async () => {
    if (update.sql_to_execute) {
      await navigator.clipboard.writeText(update.sql_to_execute)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExecuteSQL = async () => {
    if (!update.sql_to_execute) return

    const confirmed = confirm(
      `Execute this SQL?\n\n${update.sql_to_execute.slice(0, 200)}${update.sql_to_execute.length > 200 ? '...' : ''}\n\nThis will update the database and mark this update as applied.`
    )

    if (confirmed) {
      setExecuting(true)
      try {
        await onExecuteSQL(update.id, update.sql_to_execute)
      } finally {
        setExecuting(false)
      }
    }
  }

  return (
    <div className={`bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 border transition-all ${
      update.status === 'applied' ? 'border-green-500/30 opacity-75' :
      update.status === 'skipped' ? 'border-gray-600/30 opacity-60' :
      isDue ? 'border-red-500/50 shadow-lg shadow-red-500/10' :
      isDueSoon ? 'border-amber-500/50' :
      'border-gray-700/50 hover:border-gray-600/50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs rounded border ${categoryColors[update.category] || 'bg-gray-500/20 text-gray-400'}`}>
              {update.category}
            </span>
            <span className="text-xs text-gray-500">
              {changeTypeLabels[update.change_type] || update.change_type}
            </span>
          </div>
          <h3 className="font-semibold text-white">{update.title}</h3>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${
            isDue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-gray-400'
          }`}>
            {formatDate(update.effective_date)}
          </div>
          <div className={`text-xs ${
            isDue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-gray-500'
          }`}>
            {isDue ? (daysUntil === 0 ? 'Today!' : `${Math.abs(daysUntil)} days overdue`) :
             `${daysUntil} days`}
          </div>
        </div>
      </div>

      {/* Provider */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-400">Provider:</span>
        <Link href={`/providers/${update.provider_slug}`} className="text-sm text-cyan-400 hover:text-cyan-300">
          {update.provider_name}
        </Link>
      </div>

      {/* Description */}
      {update.description && (
        <p className="text-sm text-gray-400 mb-3">{update.description}</p>
      )}

      {/* Change details */}
      {(update.old_value || update.new_value) && (
        <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3 text-sm">
            {update.old_value && (
              <span className="text-red-400 line-through">{update.old_value}</span>
            )}
            {update.old_value && update.new_value && (
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
            {update.new_value && (
              <span className="text-green-400 font-medium">{update.new_value}</span>
            )}
          </div>
          {update.affected_table && (
            <div className="text-xs text-gray-500 mt-1">
              Table: {update.affected_table} {update.field_to_update && `/ ${update.field_to_update}`}
            </div>
          )}
        </div>
      )}

      {/* SQL Preview with Copy/Execute/Preview buttons */}
      {update.sql_to_execute && (
        <div className="mb-3">
          <details className="group">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 flex items-center gap-2">
              <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              SQL to execute
            </summary>
            <div className="mt-2">
              <pre className="p-2 bg-gray-800 rounded text-xs text-gray-300 overflow-x-auto mb-2">
                {update.sql_to_execute}
              </pre>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleCopySQL}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                    copied
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
                {update.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onDryRun(update)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 rounded transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview
                    </button>
                    <button
                      onClick={handleExecuteSQL}
                      disabled={executing}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors disabled:opacity-50"
                    >
                      {executing ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Running...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Execute
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Source notes */}
      {update.source_notes && (
        <p className="text-xs text-gray-500 mb-3 italic">Source: {update.source_notes}</p>
      )}

      {/* Status badge */}
      {update.status !== 'pending' && (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs mb-3 ${
          update.status === 'applied' ? 'bg-green-500/20 text-green-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {update.status === 'applied' ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Applied {update.applied_at && `on ${formatDate(update.applied_at.split('T')[0])}`}
            </>
          ) : (
            'Skipped'
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
        {update.status === 'pending' ? (
          <>
            <button
              onClick={() => onAction(update.id, 'apply')}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Mark Applied
            </button>
            <button
              onClick={() => onAction(update.id, 'skip')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              Skip
            </button>
          </>
        ) : (
          <button
            onClick={() => onAction(update.id, 'reopen')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
          >
            Reopen
          </button>
        )}
        <button
          onClick={() => {
            if (confirm('Delete this update?')) {
              onAction(update.id, 'delete')
            }
          }}
          className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function AddUpdateForm({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    provider_slug: '',
    provider_name: '',
    effective_date: '',
    category: 'pricing',
    change_type: 'price_increase',
    title: '',
    description: '',
    old_value: '',
    new_value: '',
    affected_table: '',
    field_to_update: '',
    sql_to_execute: '',
    source_notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({
          provider_slug: '',
          provider_name: '',
          effective_date: '',
          category: 'pricing',
          change_type: 'price_increase',
          title: '',
          description: '',
          old_value: '',
          new_value: '',
          affected_table: '',
          field_to_update: '',
          sql_to_execute: '',
          source_notes: '',
        })
        setIsOpen(false)
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to create update:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Update
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 rounded-xl p-6 border border-cyan-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Add Scheduled Update</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Provider Slug *</label>
              <input
                type="text"
                value={formData.provider_slug}
                onChange={e => setFormData({ ...formData, provider_slug: e.target.value })}
                placeholder="spectrum"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Provider Name *</label>
              <input
                type="text"
                value={formData.provider_name}
                onChange={e => setFormData({ ...formData, provider_name: e.target.value })}
                placeholder="Spectrum"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Effective Date *</label>
              <input
                type="date"
                value={formData.effective_date}
                onChange={e => setFormData({ ...formData, effective_date: e.target.value })}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="pricing">Pricing</option>
                <option value="product">Product</option>
                <option value="promotion">Promotion</option>
                <option value="discontinuation">Discontinuation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Change Type *</label>
              <select
                value={formData.change_type}
                onChange={e => setFormData({ ...formData, change_type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="price_increase">Price Increase</option>
                <option value="price_decrease">Price Decrease</option>
                <option value="new_product">New Product</option>
                <option value="end_promo">Promo Ending</option>
                <option value="feature_change">Feature Change</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Mobile Unlimited Plus price increase"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details..."
              rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Old Value</label>
              <input
                type="text"
                value={formData.old_value}
                onChange={e => setFormData({ ...formData, old_value: e.target.value })}
                placeholder="$40/mo"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Value</label>
              <input
                type="text"
                value={formData.new_value}
                onChange={e => setFormData({ ...formData, new_value: e.target.value })}
                placeholder="$50/mo"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Affected Table</label>
              <input
                type="text"
                value={formData.affected_table}
                onChange={e => setFormData({ ...formData, affected_table: e.target.value })}
                placeholder="broadband_plans"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Field to Update</label>
              <input
                type="text"
                value={formData.field_to_update}
                onChange={e => setFormData({ ...formData, field_to_update: e.target.value })}
                placeholder="monthly_price"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">SQL to Execute</label>
            <textarea
              value={formData.sql_to_execute}
              onChange={e => setFormData({ ...formData, sql_to_execute: e.target.value })}
              placeholder="UPDATE broadband_plans SET monthly_price = 50.00 WHERE ..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none font-mono text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Source Notes</label>
            <input
              type="text"
              value={formData.source_notes}
              onChange={e => setFormData({ ...formData, source_notes: e.target.value })}
              placeholder="Spectrum Marketing Guidelines PDF, received 1/1/2026"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<ScheduledUpdate[]>([])
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, dueSoon: 0, upcomingThisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'applied' | 'skipped'>('pending')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [providerFilter, setProviderFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAuditLog, setShowAuditLog] = useState(true)
  const [batchApplying, setBatchApplying] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Dry run modal state
  const [dryRunModal, setDryRunModal] = useState<{
    isOpen: boolean
    update: ScheduledUpdate | null
    result: DryRunResult | null
    loading: boolean
  }>({ isOpen: false, update: null, result: null, loading: false })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchUpdates = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      params.set('auditLog', 'true')

      const res = await fetch(`/api/admin/updates?${params}`)
      const data = await res.json()
      if (data.success) {
        setUpdates(data.data)
        setStats(data.stats)
        setAuditLog(data.auditLog || [])
      }
    } catch (error) {
      console.error('Failed to fetch updates:', error)
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    fetchUpdates()
  }, [fetchUpdates])

  const handleAction = async (id: number, action: 'apply' | 'skip' | 'reopen' | 'delete') => {
    try {
      if (action === 'delete') {
        await fetch(`/api/admin/updates/${id}`, { method: 'DELETE' })
      } else {
        await fetch(`/api/admin/updates/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        })
      }
      fetchUpdates()
    } catch (error) {
      console.error('Action failed:', error)
    }
  }

  const handleExecuteSQL = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/updates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute_sql' }),
      })
      const data = await res.json()

      if (data.success) {
        showToast(data.message || 'SQL executed successfully', 'success')
        fetchUpdates()
      } else {
        if (data.error?.includes('function not configured')) {
          showToast('Auto-execute not available. Please copy and run SQL manually.', 'error')
        } else {
          showToast(data.error || 'Failed to execute SQL', 'error')
        }
      }
    } catch (error) {
      console.error('Execute SQL failed:', error)
      showToast('Failed to execute SQL', 'error')
    }
  }

  const handleDryRun = async (update: ScheduledUpdate) => {
    setDryRunModal({ isOpen: true, update, result: null, loading: true })

    try {
      const res = await fetch(`/api/admin/updates/${update.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dry_run' }),
      })
      const data = await res.json()

      setDryRunModal(prev => ({
        ...prev,
        loading: false,
        result: data.dryRun || { success: false, error: data.error },
      }))
    } catch (_error) {
      setDryRunModal(prev => ({
        ...prev,
        loading: false,
        result: { success: false, error: 'Failed to run preview' },
      }))
    }
  }

  const handleBatchApply = async () => {
    const dueUpdates = updates.filter(u => u.status === 'pending' && getDaysUntil(u.effective_date) <= 0)

    if (dueUpdates.length === 0) {
      showToast('No due updates to apply', 'error')
      return
    }

    const confirmed = confirm(
      `Mark ${dueUpdates.length} due update${dueUpdates.length > 1 ? 's' : ''} as applied?\n\n` +
      `Updates:\n${dueUpdates.map(u => `- ${u.title}`).join('\n')}\n\n` +
      `Note: SQL statements will need to be executed manually.`
    )

    if (!confirmed) return

    setBatchApplying(true)
    try {
      const res = await fetch('/api/admin/updates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch_apply' }),
      })
      const data = await res.json()

      if (data.success) {
        if (data.sqlStatements && data.sqlStatements.length > 0) {
          const sqlList = data.sqlStatements.map((s: { title: string; sql: string }) =>
            `-- ${s.title}\n${s.sql}`
          ).join('\n\n')
          await navigator.clipboard.writeText(sqlList)
          showToast(`${data.applied} updates applied. ${data.sqlStatements.length} SQL statements copied to clipboard!`, 'success')
        } else {
          showToast(data.message || `${data.applied} updates applied`, 'success')
        }
        fetchUpdates()
      } else {
        showToast(data.error || 'Failed to batch apply', 'error')
      }
    } catch (error) {
      console.error('Batch apply failed:', error)
      showToast('Failed to batch apply updates', 'error')
    } finally {
      setBatchApplying(false)
    }
  }

  const clearDateFilter = () => {
    setDateFrom('')
    setDateTo('')
  }

  const filteredUpdates = updates
    .filter(u => u.status === activeTab)
    .filter(u => !providerFilter || u.provider_slug === providerFilter)
    .filter(u => !selectedDate || u.effective_date === selectedDate)

  const uniqueProviders = [...new Set(updates.map(u => u.provider_slug))]

  return (
    <div className="p-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Dry Run Modal */}
      <DryRunModal
        isOpen={dryRunModal.isOpen}
        onClose={() => setDryRunModal({ isOpen: false, update: null, result: null, loading: false })}
        update={dryRunModal.update}
        dryRunResult={dryRunModal.result}
        isLoading={dryRunModal.loading}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Provider Updates
          </h1>
          <p className="text-gray-400 mt-2">Track and manage upcoming provider pricing and product changes</p>
        </div>
        <div className="flex items-center gap-3">
          {stats.dueSoon > 0 && (
            <button
              onClick={handleBatchApply}
              disabled={batchApplying}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {batchApplying ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Applying...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Batch Apply ({stats.dueSoon})
                </>
              )}
            </button>
          )}
          <AddUpdateForm onSuccess={fetchUpdates} />
        </div>
      </div>

      <div>
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50">
                <div className="text-3xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
              <div className="bg-gray-900/60 rounded-xl p-4 border border-cyan-500/30">
                <div className="text-3xl font-bold text-cyan-400">{stats.pending}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
              <div className="bg-gray-900/60 rounded-xl p-4 border border-red-500/30">
                <div className="text-3xl font-bold text-red-400">{stats.dueSoon}</div>
                <div className="text-sm text-gray-400">Due/Overdue</div>
              </div>
              <div className="bg-gray-900/60 rounded-xl p-4 border border-amber-500/30">
                <div className="text-3xl font-bold text-amber-400">{stats.upcomingThisMonth}</div>
                <div className="text-sm text-gray-400">This Month</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex gap-2">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'calendar' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Calendar
                  </button>
                </div>

                {/* Status Tabs */}
                {viewMode === 'list' && (
                  <div className="flex gap-1">
                    {(['pending', 'applied', 'skipped'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedDate(null) }}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        <span className="ml-1 text-xs opacity-60">
                          {updates.filter(u => u.status === tab).length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Date Range Filter */}
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                  {(dateFrom || dateTo) && (
                    <button
                      onClick={clearDateFilter}
                      className="text-gray-500 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Provider Filter */}
                {uniqueProviders.length > 0 && (
                  <select
                    value={providerFilter}
                    onChange={e => setProviderFilter(e.target.value)}
                    className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">All Providers</option>
                    {uniqueProviders.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Selected Date Banner */}
            {selectedDate && (
              <div className="mb-4 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-between">
                <span className="text-sm text-cyan-400">
                  Showing updates for {formatDate(selectedDate)}
                </span>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading updates...</p>
              </div>
            ) : viewMode === 'calendar' ? (
              <CalendarView
                updates={updates.filter(u => u.status === 'pending')}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                onSelectDate={setSelectedDate}
              />
            ) : filteredUpdates.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/40 rounded-xl border border-gray-800">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-400 mb-2">No {activeTab} updates</p>
                <p className="text-sm text-gray-500">
                  {activeTab === 'pending' ? 'Add an update to get started' : `No updates have been ${activeTab} yet`}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {filteredUpdates.map(update => (
                  <UpdateCard
                    key={update.id}
                    update={update}
                    onAction={handleAction}
                    onExecuteSQL={handleExecuteSQL}
                    onDryRun={handleDryRun}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Audit Log */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-8">
              <div className="bg-gray-900/60 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <h3 className="font-semibold text-white">Activity Log</h3>
                  <button
                    onClick={() => setShowAuditLog(!showAuditLog)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className={`w-4 h-4 transition-transform ${showAuditLog ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {showAuditLog && (
                  <div className="p-4">
                    <AuditLogPanel auditLog={auditLog} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
