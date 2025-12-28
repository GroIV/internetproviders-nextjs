/**
 * Content Fetching Helper
 *
 * Fetches pre-generated HTML content from the Supabase `content` table.
 * Used by page templates to render editorial content.
 */

import { createAdminClient } from '@/lib/supabase/server'

export interface ContentMetadata {
  title: string
  description: string
  keywords?: string[]
  author?: string
  publishedAt?: string
  modifiedAt?: string
  image?: string
  jsonLd?: Record<string, unknown>
}

export interface ContentRecord {
  id: string
  path: string
  canonical_url: string
  html: string
  metadata: ContentMetadata
  content_type: string
  slug: string
  status: string
  qa_score: number
  qa_passed: boolean
  published_at: string | null
  updated_at: string | null
}

/**
 * Fetch published content by path
 * @param path - The URL path (e.g., '/guides/technology/5g-home-internet')
 * @returns ContentRecord or null if not found/not published
 */
export async function getContentByPath(path: string): Promise<ContentRecord | null> {
  const supabase = createAdminClient()

  // Normalize path to always start with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('path', normalizedPath)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return null
  }

  return data as ContentRecord
}

/**
 * Fetch content by content type and slug
 * @param contentType - The type (e.g., 'guide', 'provider-review', 'comparison')
 * @param slug - The content slug
 * @returns ContentRecord or null
 */
export async function getContentByTypeAndSlug(
  contentType: string,
  slug: string
): Promise<ContentRecord | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('content_type', contentType)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return null
  }

  return data as ContentRecord
}

/**
 * Get all published content paths for static generation
 * @param contentType - Optional filter by content type
 * @returns Array of paths
 */
export async function getAllContentPaths(contentType?: string): Promise<string[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('content')
    .select('path')
    .eq('status', 'published')

  if (contentType) {
    query = query.eq('content_type', contentType)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data.map(d => d.path)
}

/**
 * Check if content exists for a path (without fetching full record)
 * @param path - The URL path
 * @returns boolean
 */
export async function hasPublishedContent(path: string): Promise<boolean> {
  const supabase = createAdminClient()

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  const { count, error } = await supabase
    .from('content')
    .select('id', { count: 'exact', head: true })
    .eq('path', normalizedPath)
    .eq('status', 'published')

  return !error && (count ?? 0) > 0
}
