import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const zipCode = searchParams.get('zipCode')
    const state = searchParams.get('state')

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('guides')
      .select('*', { count: 'exact' })
      .eq('status', 'published')

    if (category) {
      query = query.eq('category', category)
    }

    if (zipCode) {
      query = query.eq('zip_code', zipCode)
    }

    if (state) {
      query = query.ilike('state', state)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`)
    }

    // Execute query with pagination
    const { data, error, count } = await query
      .order('publish_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch guides' },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    // Transform data to match expected format
    const guides = data?.map(guide => ({
      id: guide.guide_id,
      title: guide.title,
      description: guide.description,
      category: guide.category,
      zipCode: guide.zip_code,
      city: guide.city,
      state: guide.state,
      url: guide.url,
      slug: guide.slug,
      publishDate: guide.publish_date,
    })) || []

    return NextResponse.json({
      success: true,
      data: guides,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        category: category || null,
        search: search || null,
        zipCode: zipCode || null,
        state: state || null,
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
