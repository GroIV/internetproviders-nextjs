'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Provider {
  id: number
  name: string
  slug: string
  category: string
  technologies: string[] | null
  plans_count: number
  created_at: string
  updated_at: string
}

const SUPABASE_URL = 'https://aogfhlompvfztymxrxfm.supabase.co'

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    withPlans: 0,
    technologies: {} as Record<string, number>,
  })

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch('/api/admin/providers')
        const data = await res.json()
        if (data.success) {
          setProviders(data.providers)
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [])

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  )

  const getSupabaseEditUrl = (tableName: string, id?: number) => {
    const base = `${SUPABASE_URL}/project/aogfhlompvfztymxrxfm/editor`
    if (id) {
      return `${base}/${tableName}?filter=id%3Aeq%3A${id}`
    }
    return `${base}/${tableName}`
  }

  const getTechColor = (tech: string) => {
    const colors: Record<string, string> = {
      'Fiber': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'Cable': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'DSL': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      '5G': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Fixed Wireless': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'Satellite': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    return colors[tech] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Providers
          </h1>
          <p className="text-gray-400 mt-2">Manage internet service providers and their plans</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={getSupabaseEditUrl('providers')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in Supabase
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">Total Providers</div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50">
              <div className="text-sm text-gray-400 mb-1">With Plans</div>
              <div className="text-3xl font-bold text-green-400">{stats.withPlans}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-emerald-500/30">
              <div className="text-sm text-gray-400 mb-1">Fiber Providers</div>
              <div className="text-3xl font-bold text-emerald-400">{stats.technologies['Fiber'] || 0}</div>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-5 border border-purple-500/30">
              <div className="text-sm text-gray-400 mb-1">5G Providers</div>
              <div className="text-3xl font-bold text-purple-400">{stats.technologies['5G'] || 0}</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search providers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2">
            <a
              href={getSupabaseEditUrl('plans')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
            >
              Edit Plans Table
            </a>
            <a
              href={getSupabaseEditUrl('provider_fcc_map')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
            >
              FCC Mapping Table
            </a>
            <a
              href={getSupabaseEditUrl('cbsa_providers')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
            >
              CBSA Coverage Table
            </a>
          </div>

          {/* Providers Table */}
          <div className="bg-gray-900/60 rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                All Providers ({filteredProviders.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-4 py-3 text-gray-400 font-medium">Provider</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Slug</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Technologies</th>
                    <th className="px-4 py-3 text-gray-400 font-medium text-right">Plans</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{provider.name}</div>
                        <div className="text-xs text-gray-500">ID: {provider.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-cyan-400 text-xs bg-gray-800 px-2 py-1 rounded">
                          {provider.slug}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {provider.technologies?.map((tech) => (
                            <span
                              key={tech}
                              className={`px-2 py-0.5 rounded text-xs border ${getTechColor(tech)}`}
                            >
                              {tech}
                            </span>
                          )) || <span className="text-gray-500">-</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {provider.plans_count > 0 ? (
                          <span className="text-green-400">{provider.plans_count}</span>
                        ) : (
                          <span className="text-gray-500">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/providers/${provider.slug}`}
                            target="_blank"
                            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                            title="View on site"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <a
                            href={getSupabaseEditUrl('providers', provider.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-green-400 transition-colors"
                            title="Edit in Supabase"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
