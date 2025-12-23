import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'

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
}

const categoryColors: Record<string, string> = {
  'budget': 'bg-green-600/20 text-green-400',
  'gaming': 'bg-purple-600/20 text-purple-400',
  'comparison': 'bg-blue-600/20 text-blue-400',
  'speed-guide': 'bg-cyan-600/20 text-cyan-400',
  'no-contracts': 'bg-orange-600/20 text-orange-400',
}

async function getGuides(page = 1, category?: string) {
  const supabase = createAdminClient()
  const limit = 24
  const offset = (page - 1) * limit

  let query = supabase
    .from('guides')
    .select('*', { count: 'exact' })
    .eq('status', 'published')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, count, error } = await query
    .order('publish_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching guides:', error)
    return { guides: [], total: 0, totalPages: 0 }
  }

  return {
    guides: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

async function getCategoryCounts() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('guides')
    .select('category')
    .eq('status', 'published')

  if (error || !data) return {}

  const counts: Record<string, number> = {}
  data.forEach(item => {
    counts[item.category] = (counts[item.category] || 0) + 1
  })
  return counts
}

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const category = params.category

  const [{ guides, total, totalPages }, categoryCounts] = await Promise.all([
    getGuides(page, category),
    getCategoryCounts(),
  ])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Internet Guides</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Expert guides to help you find the perfect internet service for your needs
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link
            href="/guides"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All ({total})
          </Link>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Link
              key={key}
              href={`/guides?category=${key}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {label} ({categoryCounts[key] || 0})
            </Link>
          ))}
        </div>

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {guides.map((guide) => (
            <article
              key={guide.guide_id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[guide.category] || 'bg-gray-600/20 text-gray-400'}`}>
                    {categoryLabels[guide.category] || guide.category}
                  </span>
                  <span className="text-xs text-gray-500">{guide.zip_code}</span>
                </div>
                <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                  <Link href={guide.url} className="hover:text-blue-400 transition-colors">
                    {guide.title}
                  </Link>
                </h2>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                  {guide.description}
                </p>
                <Link
                  href={guide.url}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                >
                  Read Guide
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/guides?page=${page - 1}${category ? `&category=${category}` : ''}`}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="px-4 py-2 text-gray-400">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/guides?page=${page + 1}${category ? `&category=${category}` : ''}`}
                className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}

        {guides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No guides found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
