import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export interface ScheduledUpdate {
  id: number
  provider_slug: string
  provider_name: string
  effective_date: string
  category: 'pricing' | 'product' | 'promotion' | 'discontinuation'
  change_type: 'price_increase' | 'price_decrease' | 'new_product' | 'end_promo' | 'feature_change'
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
  applied_by: string | null
  created_at: string
  updated_at: string
}

// GET - List all scheduled updates
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams

    const status = searchParams.get('status')
    const provider = searchParams.get('provider')
    const upcoming = searchParams.get('upcoming') === 'true'

    let query = supabase
      .from('provider_scheduled_updates')
      .select('*')
      .order('effective_date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    if (provider) {
      query = query.eq('provider_slug', provider)
    }

    if (upcoming) {
      query = query.gte('effective_date', new Date().toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch updates' }, { status: 500 })
    }

    // Group by status for dashboard
    const grouped = {
      pending: (data || []).filter(u => u.status === 'pending'),
      applied: (data || []).filter(u => u.status === 'applied'),
      skipped: (data || []).filter(u => u.status === 'skipped'),
    }

    // Calculate stats
    const today = new Date().toISOString().split('T')[0]
    const stats = {
      total: data?.length || 0,
      pending: grouped.pending.length,
      dueSoon: grouped.pending.filter(u => u.effective_date <= today).length,
      upcomingThisMonth: grouped.pending.filter(u => {
        const effectiveDate = new Date(u.effective_date)
        const now = new Date()
        return effectiveDate.getMonth() === now.getMonth() && effectiveDate.getFullYear() === now.getFullYear()
      }).length,
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      grouped,
      stats,
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new scheduled update
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const {
      provider_slug,
      provider_name,
      effective_date,
      category,
      change_type,
      title,
      description,
      affected_table,
      field_to_update,
      old_value,
      new_value,
      sql_to_execute,
      source_file,
      source_notes,
    } = body

    // Validate required fields
    if (!provider_slug || !provider_name || !effective_date || !category || !change_type || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: provider_slug, provider_name, effective_date, category, change_type, title'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('provider_scheduled_updates')
      .insert({
        provider_slug,
        provider_name,
        effective_date,
        category,
        change_type,
        title,
        description,
        affected_table,
        field_to_update,
        old_value,
        new_value,
        sql_to_execute,
        source_file,
        source_notes,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create update' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Batch operations (apply all due, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { action, ids } = body

    if (action === 'batch_apply') {
      // Get all pending updates that are due (effective_date <= today)
      const today = new Date().toISOString().split('T')[0]

      let query = supabase
        .from('provider_scheduled_updates')
        .select('*')
        .eq('status', 'pending')
        .lte('effective_date', today)

      // If specific IDs provided, filter to those
      if (ids && Array.isArray(ids) && ids.length > 0) {
        query = query.in('id', ids)
      }

      const { data: dueUpdates, error: fetchError } = await query

      if (fetchError) {
        return NextResponse.json({ success: false, error: 'Failed to fetch due updates' }, { status: 500 })
      }

      if (!dueUpdates || dueUpdates.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No due updates to apply',
          applied: 0
        })
      }

      // Mark all as applied
      const updateIds = dueUpdates.map(u => u.id)
      const { error: updateError } = await supabase
        .from('provider_scheduled_updates')
        .update({
          status: 'applied',
          applied_at: new Date().toISOString(),
          applied_by: 'admin (batch)',
          updated_at: new Date().toISOString(),
        })
        .in('id', updateIds)

      if (updateError) {
        return NextResponse.json({ success: false, error: 'Failed to apply updates' }, { status: 500 })
      }

      // Collect SQL statements that need manual execution
      const sqlStatements = dueUpdates
        .filter(u => u.sql_to_execute)
        .map(u => ({
          id: u.id,
          title: u.title,
          sql: u.sql_to_execute
        }))

      return NextResponse.json({
        success: true,
        message: `${updateIds.length} updates marked as applied`,
        applied: updateIds.length,
        sqlStatements: sqlStatements.length > 0 ? sqlStatements : undefined,
        note: sqlStatements.length > 0
          ? `${sqlStatements.length} updates have SQL that may need manual execution`
          : undefined
      })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
