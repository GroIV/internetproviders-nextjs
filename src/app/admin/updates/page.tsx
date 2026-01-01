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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function UpdateCard({
  update,
  onAction,
}: {
  update: ScheduledUpdate
  onAction: (id: number, action: 'apply' | 'skip' | 'reopen' | 'delete') => void
}) {
  const daysUntil = getDaysUntil(update.effective_date)
  const isDue = daysUntil <= 0
  const isDueSoon = daysUntil > 0 && daysUntil <= 7

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

      {/* SQL Preview */}
      {update.sql_to_execute && (
        <details className="mb-3">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
            View SQL to execute
          </summary>
          <pre className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 overflow-x-auto">
            {update.sql_to_execute}
          </pre>
        </details>
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
          <>
            <button
              onClick={() => onAction(update.id, 'reopen')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              Reopen
            </button>
          </>
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
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30">
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
            placeholder="Additional details about this change..."
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
  )
}

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<ScheduledUpdate[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, dueSoon: 0, upcomingThisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'applied' | 'skipped'>('pending')
  const [providerFilter, setProviderFilter] = useState<string>('')

  const fetchUpdates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/updates')
      const data = await res.json()
      if (data.success) {
        setUpdates(data.data)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch updates:', error)
    } finally {
      setLoading(false)
    }
  }, [])

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

  const filteredUpdates = updates
    .filter(u => u.status === activeTab)
    .filter(u => !providerFilter || u.provider_slug === providerFilter)

  const uniqueProviders = [...new Set(updates.map(u => u.provider_slug))]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/" className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Provider Updates Tracker
                </h1>
              </div>
              <p className="text-gray-400">Track and manage upcoming provider pricing and product changes</p>
            </div>
            <AddUpdateForm onSuccess={fetchUpdates} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Updates</div>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(['pending', 'applied', 'skipped'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-2 px-2 py-0.5 bg-black/30 rounded text-xs">
                  {updates.filter(u => u.status === tab).length}
                </span>
              </button>
            ))}
          </div>

          {uniqueProviders.length > 0 && (
            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Providers</option>
              {uniqueProviders.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}
        </div>

        {/* Updates List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading updates...</p>
          </div>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUpdates.map(update => (
              <UpdateCard key={update.id} update={update} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
