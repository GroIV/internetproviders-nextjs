import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Helper to log actions to audit log
async function logAuditAction(
  supabase: ReturnType<typeof createAdminClient>,
  updateId: number | null,
  updateTitle: string,
  action: string,
  details?: Record<string, unknown>
) {
  try {
    await supabase.from('provider_update_audit_log').insert({
      update_id: updateId,
      update_title: updateTitle,
      action,
      action_by: 'admin',
      details: details || null,
    })
  } catch (err) {
    console.error('Failed to log audit action:', err)
  }
}

// Helper to execute raw SQL using Supabase's postgres connection
async function executeSQL(sql: string): Promise<{ success: boolean; rowCount?: number; error?: string }> {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase.rpc('execute_admin_sql', { sql_query: sql })

    if (error) {
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

// Helper to parse SQL and estimate affected rows
async function dryRunSQL(sql: string): Promise<{ success: boolean; estimatedRows?: number; currentValues?: Record<string, unknown>[]; error?: string }> {
  const supabase = createAdminClient()

  try {
    // Parse UPDATE statement to extract table and WHERE clause
    const updateMatch = sql.match(/UPDATE\s+(\w+)\s+SET\s+([\s\S]+?)\s+WHERE\s+([\s\S]+?);?$/i)

    if (!updateMatch) {
      return { success: false, error: 'Could not parse SQL statement. Only UPDATE statements are supported for dry run.' }
    }

    const [, tableName, setClause, whereClause] = updateMatch

    // Extract the field being updated
    const fieldMatch = setClause.match(/(\w+)\s*=\s*([^,]+)/)
    const fieldToUpdate = fieldMatch ? fieldMatch[1] : null

    // Build a SELECT query to find affected rows
    const selectQuery = `SELECT * FROM ${tableName} WHERE ${whereClause.replace(/;$/, '')}`

    // For broadband_plans, we can query directly
    if (tableName === 'broadband_plans') {
      // Parse the WHERE clause to build Supabase query
      let query = supabase.from('broadband_plans').select('id, service_plan_name, monthly_price, provider_name, connection_type')

      // Try to extract conditions from WHERE clause
      const providerMatch = whereClause.match(/provider_name\s+ILIKE\s+'([^']+)'/i)
      const planMatch = whereClause.match(/service_plan_name\s*=\s*'([^']+)'/i)
      const typeMatch = whereClause.match(/connection_type\s*=\s*'([^']+)'/i)

      if (providerMatch) {
        query = query.ilike('provider_name', providerMatch[1])
      }
      if (planMatch) {
        query = query.eq('service_plan_name', planMatch[1])
      }
      if (typeMatch) {
        query = query.eq('connection_type', typeMatch[1])
      }

      const { data, error } = await query.limit(10)

      if (error) {
        return { success: false, error: `Query failed: ${error.message}` }
      }

      return {
        success: true,
        estimatedRows: data?.length || 0,
        currentValues: data?.map(row => ({
          id: row.id,
          plan: row.service_plan_name,
          provider: row.provider_name,
          type: row.connection_type,
          currentPrice: row.monthly_price,
          field: fieldToUpdate,
        })) || []
      }
    }

    // For other tables, return a generic message
    return {
      success: true,
      estimatedRows: undefined,
      error: `Dry run not fully supported for table: ${tableName}. Please verify manually.`
    }

  } catch (err) {
    return { success: false, error: String(err) }
  }
}

// GET - Get single update with optional dry run
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams
    const includeDryRun = searchParams.get('dryRun') === 'true'
    const includeAuditLog = searchParams.get('auditLog') === 'true'

    const { data, error } = await supabase
      .from('provider_scheduled_updates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: 'Update not found' }, { status: 404 })
    }

    let dryRunResult = null
    if (includeDryRun && data.sql_to_execute) {
      dryRunResult = await dryRunSQL(data.sql_to_execute)
    }

    let auditLog = null
    if (includeAuditLog) {
      const { data: logData } = await supabase
        .from('provider_update_audit_log')
        .select('*')
        .eq('update_id', parseInt(id))
        .order('created_at', { ascending: false })
        .limit(20)
      auditLog = logData
    }

    return NextResponse.json({
      success: true,
      data,
      dryRun: dryRunResult,
      auditLog,
    })

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
      const { data: updateData, error: fetchError } = await supabase
        .from('provider_scheduled_updates')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !updateData) {
        return NextResponse.json({ success: false, error: 'Update not found' }, { status: 404 })
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

      // Log to audit
      await logAuditAction(supabase, parseInt(id), updateData.title, 'applied', {
        hasSql: !!updateData.sql_to_execute,
      })

      return NextResponse.json({
        success: true,
        data,
        message: updateData.sql_to_execute
          ? 'Update marked as applied. SQL may need manual execution.'
          : 'Update marked as applied.'
      })
    }

    if (action === 'skip') {
      const { data: updateData } = await supabase
        .from('provider_scheduled_updates')
        .select('title')
        .eq('id', id)
        .single()

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

      await logAuditAction(supabase, parseInt(id), updateData?.title || 'Unknown', 'skipped')

      return NextResponse.json({ success: true, data })
    }

    if (action === 'reopen') {
      const { data: updateData } = await supabase
        .from('provider_scheduled_updates')
        .select('title')
        .eq('id', id)
        .single()

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

      await logAuditAction(supabase, parseInt(id), updateData?.title || 'Unknown', 'reopened')

      return NextResponse.json({ success: true, data })
    }

    // Dry run action - just preview what would happen
    if (action === 'dry_run') {
      const { data: updateData, error: fetchError } = await supabase
        .from('provider_scheduled_updates')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !updateData) {
        return NextResponse.json({ success: false, error: 'Update not found' }, { status: 404 })
      }

      if (!updateData.sql_to_execute) {
        return NextResponse.json({ success: false, error: 'No SQL to preview for this update' }, { status: 400 })
      }

      const dryRunResult = await dryRunSQL(updateData.sql_to_execute)

      await logAuditAction(supabase, parseInt(id), updateData.title, 'dry_run', {
        estimatedRows: dryRunResult.estimatedRows,
      })

      return NextResponse.json({
        success: true,
        dryRun: dryRunResult,
        sql: updateData.sql_to_execute,
      })
    }

    // Execute SQL action - runs the SQL and marks as applied
    if (action === 'execute_sql') {
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
        await logAuditAction(supabase, parseInt(id), updateData.title, 'sql_execute_failed', {
          error: sqlResult.error,
        })

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

      await logAuditAction(supabase, parseInt(id), updateData.title, 'sql_executed', {
        rowsAffected: sqlResult.rowCount,
      })

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

    // Get title before deletion for audit log
    const { data: updateData } = await supabase
      .from('provider_scheduled_updates')
      .select('title')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('provider_scheduled_updates')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to delete update' }, { status: 500 })
    }

    await logAuditAction(supabase, null, updateData?.title || 'Unknown', 'deleted', {
      deletedId: parseInt(id),
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
