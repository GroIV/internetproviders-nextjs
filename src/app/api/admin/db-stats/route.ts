import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface TableStats {
  name: string
  rowCount: number
  estimatedSize: string
}

// GET /api/admin/db-stats
export async function GET() {
  try {
    const supabase = createAdminClient()

    // Tables to check
    const tables = [
      'providers',
      'plans',
      'broadband_plans',
      'tv_plans',
      'fcc_providers',
      'cbsa_providers',
      'zip_cbsa_mapping',
      'guides',
      'api_usage',
      'chat_sessions',
      'affiliate_clicks',
      'scheduled_updates',
    ]

    const tableStats: TableStats[] = []

    // Get row counts for each table
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (!error) {
          // Estimate size based on row count (rough estimate)
          const rowCount = count || 0
          let estimatedSize = '0 B'
          const avgRowSize = table === 'chat_sessions' ? 5000 :
                            table === 'api_usage' ? 500 :
                            table === 'guides' ? 10000 :
                            table === 'cbsa_providers' ? 100 :
                            table === 'zip_cbsa_mapping' ? 50 : 200

          const totalBytes = rowCount * avgRowSize
          if (totalBytes >= 1024 * 1024 * 1024) {
            estimatedSize = `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
          } else if (totalBytes >= 1024 * 1024) {
            estimatedSize = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
          } else if (totalBytes >= 1024) {
            estimatedSize = `${(totalBytes / 1024).toFixed(2)} KB`
          } else {
            estimatedSize = `${totalBytes} B`
          }

          tableStats.push({
            name: table,
            rowCount,
            estimatedSize,
          })
        }
      } catch {
        // Table might not exist
        tableStats.push({
          name: table,
          rowCount: 0,
          estimatedSize: 'N/A',
        })
      }
    }

    // Sort by row count descending
    tableStats.sort((a, b) => b.rowCount - a.rowCount)

    // Calculate totals
    const totalRows = tableStats.reduce((sum, t) => sum + t.rowCount, 0)

    // Get recent activity
    const recentActivity: Array<{ table: string; action: string; count: number; period: string }> = []

    // API usage last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: apiUsage24h } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday)

    if (apiUsage24h) {
      recentActivity.push({ table: 'api_usage', action: 'inserts', count: apiUsage24h, period: '24h' })
    }

    // Chat sessions last 24h
    const { count: chatSessions24h } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday)

    if (chatSessions24h !== null) {
      recentActivity.push({ table: 'chat_sessions', action: 'inserts', count: chatSessions24h, period: '24h' })
    }

    // Affiliate clicks last 24h
    const { count: affiliateClicks24h } = await supabase
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday)

    if (affiliateClicks24h !== null) {
      recentActivity.push({ table: 'affiliate_clicks', action: 'inserts', count: affiliateClicks24h, period: '24h' })
    }

    // Scheduled updates last 7d
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: updates7d } = await supabase
      .from('scheduled_updates')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastWeek)

    if (updates7d !== null) {
      recentActivity.push({ table: 'scheduled_updates', action: 'inserts', count: updates7d, period: '7d' })
    }

    return NextResponse.json({
      success: true,
      stats: {
        tables: tableStats,
        totalRows,
        totalTables: tableStats.length,
        recentActivity,
      },
    })
  } catch (error) {
    console.error('DB stats error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
