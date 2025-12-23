import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import { GuidesClient } from './GuidesClient'

export const metadata: Metadata = {
  title: 'Internet Guides',
  description: 'Comprehensive guides to help you choose the best internet service. Compare providers, understand speeds, and find the right plan for your needs.',
}

const categoryLabels: Record<string, string> = {
  'budget': 'Budget-Friendly',
  'gaming': 'Gaming',
  'comparison': 'Comparisons',
  'speed-guide': 'Speed Guides',
  'no-contracts': 'No Contract',
  'streaming': 'Streaming',
  'work-from-home': 'Work From Home',
  'family': 'Family',
}

const categoryColors: Record<string, string> = {
  'budget': 'bg-green-600/20 text-green-400',
  'gaming': 'bg-purple-600/20 text-purple-400',
  'comparison': 'bg-blue-600/20 text-blue-400',
  'speed-guide': 'bg-cyan-600/20 text-cyan-400',
  'no-contracts': 'bg-orange-600/20 text-orange-400',
  'streaming': 'bg-red-600/20 text-red-400',
  'work-from-home': 'bg-indigo-600/20 text-indigo-400',
  'family': 'bg-pink-600/20 text-pink-400',
}

const categoryIcons: Record<string, string> = {
  'budget': '💰',
  'gaming': '🎮',
  'comparison': '🔌',
  'speed-guide': '⚡',
  'no-contracts': '📝',
  'streaming': '📺',
  'work-from-home': '💼',
  'family': '👨‍👩‍👧‍👦',
}

interface Guide {
  guide_id: string
  title: string
  description: string
  category: string
  zip_code: string
  city: string
  state: string | null
  slug: string
  publish_date: string
}

async function getGuides(page: number, limit: number, category?: string, zipCode?: string) {
  const supabase = createAdminClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('guides')
    .select('*', { count: 'exact' })
    .eq('status', 'published')

  if (category) {
    query = query.eq('category', category)
  }

  // If zipCode provided, filter to that ZIP or nearby (same city)
  if (zipCode) {
    query = query.eq('zip_code', zipCode)
  }

  const { data, error, count } = await query
    .order('publish_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching guides:', error)
    return { guides: [], total: 0 }
  }

  return { guides: data || [], total: count || 0 }
}

// Get unique guides (one per slug) for general browsing
async function getUniqueGuides(page: number, limit: number, category?: string) {
  const supabase = createAdminClient()

  // First get distinct slugs with their first occurrence
  let query = supabase
    .from('guides')
    .select('slug, title, description, category, city, zip_code, publish_date, guide_id')
    .eq('status', 'published')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
    .order('publish_date', { ascending: false })

  if (error || !data) {
    console.error('Error fetching guides:', error)
    return { guides: [], total: 0 }
  }

  // Deduplicate by slug, keeping first occurrence
  const seenSlugs = new Set<string>()
  const uniqueGuides = data.filter(guide => {
    if (seenSlugs.has(guide.slug)) {
      return false
    }
    seenSlugs.add(guide.slug)
    return true
  })

  const total = uniqueGuides.length
  const offset = (page - 1) * limit
  const paginatedGuides = uniqueGuides.slice(offset, offset + limit)

  return { guides: paginatedGuides, total }
}

async function getCategoryCounts(zipCode?: string) {
  const supabase = createAdminClient()

  let query = supabase
    .from('guides')
    .select('category, slug')
    .eq('status', 'published')

  if (zipCode) {
    query = query.eq('zip_code', zipCode)
  }

  const { data, error } = await query

  if (error || !data) return {}

  // If no zipCode, deduplicate by slug before counting
  const counts: Record<string, number> = {}

  if (zipCode) {
    data.forEach((guide) => {
      counts[guide.category] = (counts[guide.category] || 0) + 1
    })
  } else {
    const seenSlugs = new Set<string>()
    data.forEach((guide) => {
      if (!seenSlugs.has(guide.slug)) {
        seenSlugs.add(guide.slug)
        counts[guide.category] = (counts[guide.category] || 0) + 1
      }
    })
  }

  return counts
}

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; zip?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const category = params.category
  const zipCode = params.zip
  const limit = 24

  // If user has a ZIP code, show guides for their area
  // Otherwise show unique guides (deduplicated by slug)
  const [{ guides, total }, categoryCounts] = await Promise.all([
    zipCode
      ? getGuides(page, limit, category, zipCode)
      : getUniqueGuides(page, limit, category),
    getCategoryCounts(zipCode),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Internet Guides</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Expert guides to help you find the perfect internet service for your needs.
            Browse {total.toLocaleString()} guides across all categories.
          </p>
        </div>

        {/* Location-aware component */}
        <GuidesClient
          zipCode={zipCode}
          zipHasGuides={true}
          categoryLabels={categoryLabels}
          categoryColors={categoryColors}
        />

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Link
            href={`/guides${zipCode ? `?zip=${zipCode}` : ''}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All ({total.toLocaleString()})
          </Link>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const count = categoryCounts[key] || 0
            if (count === 0) return null
            return (
              <Link
                key={key}
                href={`/guides?category=${key}${zipCode ? `&zip=${zipCode}` : ''}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {categoryIcons[key]} {label} ({count.toLocaleString()})
              </Link>
            )
          })}
        </div>

        {/* Results Info */}
        <div className="text-center text-gray-400 text-sm mb-6">
          Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} of {total.toLocaleString()} guides
          {category && ` in ${categoryLabels[category] || category}`}
        </div>

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {guides.map((guide: Guide) => (
            <article
              key={guide.guide_id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[guide.category] || 'bg-gray-600/20 text-gray-400'}`}>
                    {categoryIcons[guide.category]} {categoryLabels[guide.category] || guide.category}
                  </span>
                  <span className="text-xs text-gray-500">{guide.zip_code}</span>
                </div>
                <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                  <Link
                    href={`/guides/${guide.slug}?zip=${guide.zip_code}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {guide.title}
                  </Link>
                </h2>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                  {guide.description}
                </p>
                <div className="flex items-center justify-between">
                  <Link
                    href={`/guides/${guide.slug}?zip=${guide.zip_code}`}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                  >
                    Read Guide
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  {guide.city && (
                    <span className="text-xs text-gray-500">{guide.city}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {guides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No guides found for this category.</p>
            <Link href="/guides" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
              View all guides
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-12">
            {page > 1 && (
              <Link
                href={`/guides?page=${page - 1}${category ? `&category=${category}` : ''}${zipCode ? `&zip=${zipCode}` : ''}`}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Previous
              </Link>
            )}

            <div className="flex items-center gap-1">
              {/* First page */}
              {page > 3 && (
                <>
                  <Link
                    href={`/guides?page=1${category ? `&category=${category}` : ''}${zipCode ? `&zip=${zipCode}` : ''}`}
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    1
                  </Link>
                  {page > 4 && <span className="text-gray-500 px-2">...</span>}
                </>
              )}

              {/* Page numbers around current */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                if (pageNum > totalPages || pageNum < 1) return null
                return (
                  <Link
                    key={pageNum}
                    href={`/guides?page=${pageNum}${category ? `&category=${category}` : ''}${zipCode ? `&zip=${zipCode}` : ''}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                      page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              })}

              {/* Last page */}
              {page < totalPages - 2 && (
                <>
                  {page < totalPages - 3 && <span className="text-gray-500 px-2">...</span>}
                  <Link
                    href={`/guides?page=${totalPages}${category ? `&category=${category}` : ''}${zipCode ? `&zip=${zipCode}` : ''}`}
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {totalPages}
                  </Link>
                </>
              )}
            </div>

            {page < totalPages && (
              <Link
                href={`/guides?page=${page + 1}${category ? `&category=${category}` : ''}${zipCode ? `&zip=${zipCode}` : ''}`}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        )}

        {/* Popular Locations */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">Browse by Location</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <Link
              href="/internet/texas"
              className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              Texas
            </Link>
            <Link
              href="/internet/california"
              className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              California
            </Link>
            <Link
              href="/internet/florida"
              className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              Florida
            </Link>
            <Link
              href="/internet/new-york"
              className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              New York
            </Link>
          </div>
          <div className="text-center mt-4">
            <Link
              href="/internet"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View all states →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
