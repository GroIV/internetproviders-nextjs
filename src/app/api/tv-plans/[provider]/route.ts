import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const supabase = createAdminClient()

  const { data: plans, error } = await supabase
    .from('tv_plans')
    .select('*')
    .eq('provider_name', provider)
    .eq('is_active', true)
    .order('total_min', { ascending: true })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: plans || [] })
}
