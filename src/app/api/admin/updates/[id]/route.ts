import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Helper to execute raw SQL using Supabase's postgres connection
async function executeSQL(sql: string): Promise<{ success: boolean; rowCount?: number; error?: string }> {
  const supabase = createAdminClient()

  try {
    // Use Supabase's rpc to execute raw SQL
    // We'll create a simple function or use direct query
    const { data, error } = await supabase.rpc('execute_admin_sql', { sql_query: sql })

    if (error) {
      // If the function doesn't exist, return instructions
      if (error.message.includes('function') || error.code === '42883') {
        return {
          success: false,
          error: 'SQL function not configured. Please run SQL manually or set up the execute_admin_sql function.'
        }
      }
      return { success: false, error: error.message }
    }

    return { success: true, rowCount: data?.row_count || 0 }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

// GET - Get single update
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('provider_scheduled_updates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: 'Update not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update status or apply changes
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()
    const body = await request.json()

    const { action, ...updates } = body

    // Handle special actions
    if (action === 'apply') {
      // First, get the update to check if it has SQL to execute
      const { data: updateData, error: fetchError } = await supabase
        .from('provider_scheduled_updates')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !updateData) {
        return NextResponse.json({ success: false, error: 'Update not found' }, { status: 404 })
      }

      // Execute the SQL if provided
      if (updateData.sql_to_execute) {
        const { error: sqlError } = await supabase.rpc('exec_sql', {
          sql_query: updateData.sql_to_execute
        })

        if (sqlError) {
          // If RPC doesn't exist, just mark it as needing manual execution
          console.warn('Could not auto-execute SQL:', sqlError.message)
        }
      }

      // Mark as applied
      const { data, error } = await supabase
        .from('provider_scheduled_updates')
        .update({
          status: 'applied',
          applied_at: new Date().toISOString(),
          applied_by: 'admin',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: 'Failed to apply update' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data,
        message: updateData.sql_to_execute
          ? 'Update marked as applied. SQL may need manual execution.'
          : 'Update marked as applied.'
      })
    }

    if (action === 'skip') {
      const { data, error } = await supabase
        .from('provider_scheduled_updates')
        .update({
          status: 'skipped',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: 'Failed to skip update' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    if (action === 'reopen') {
      const { data, error } = await supabase
        .from('provider_scheduled_updates')
        .update({
          status: 'pending',
          applied_at: null,
          applied_by: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: 'Failed to reopen update' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    // Execute SQL action - runs the SQL and marks as applied
    if (action === 'execute_sql') {
      // First, get the update to check if it has SQL to execute
      const { data: updateData, error: fetchError } = await supabase
        .from('provider_scheduled_updates')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !updateData) {
        return NextResponse.json({ success: false, error: 'Update not found' }, { status: 404 })
      }

      if (!updateData.sql_to_execute) {
        return NextResponse.json({ success: false, error: 'No SQL to execute for this update' }, { status: 400 })
      }

      // Execute the SQL
      const sqlResult = await executeSQL(updateData.sql_to_execute)

      if (!sqlResult.success) {
        return NextResponse.json({
          success: false,
          error: sqlResult.error,
          sql: updateData.sql_to_execute
        }, { status: 500 })
      }

      // Mark as applied
      const { data, error } = await supabase
        .from('provider_scheduled_updates')
        .update({
          status: 'applied',
          applied_at: new Date().toISOString(),
          applied_by: 'admin (auto-executed)',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({
          success: false,
          error: 'SQL executed but failed to update status',
          sqlExecuted: true
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data,
        message: `SQL executed successfully. ${sqlResult.rowCount !== undefined ? `${sqlResult.rowCount} rows affected.` : ''}`,
        sqlExecuted: true
      })
    }

    // Generic update
    const { data, error } = await supabase
      .from('provider_scheduled_updates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove an update
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('provider_scheduled_updates')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to delete update' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
