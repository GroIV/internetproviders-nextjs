import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const provider = searchParams.get('provider')
    const providerSlug = searchParams.get('providerSlug')
    const serviceType = searchParams.get('serviceType') // residential, mobile
    const connectionType = searchParams.get('connectionType') // Fixed, Mobile
    const minSpeed = parseInt(searchParams.get('minSpeed') || '0', 10)
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '0')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const sortBy = searchParams.get('sortBy') || 'monthly_price' // monthly_price, typical_download_speed
    const sortOrder = searchParams.get('sortOrder') || 'asc' // asc, desc

    // Build query
    let query = supabase
      .from('broadband_plans')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (provider) {
      query = query.ilike('provider_name', `%${provider}%`)
    }

    if (providerSlug) {
      // Get provider ID from slug
      const { data: providerData } = await supabase
        .from('providers')
        .select('id')
        .eq('slug', providerSlug)
        .single()

      if (providerData) {
        query = query.eq('provider_id', providerData.id)
      }
    }

    if (serviceType) {
      query = query.eq('service_type', serviceType)
    }

    if (connectionType) {
      query = query.eq('connection_type', connectionType)
    }

    if (minSpeed > 0) {
      query = query.gte('typical_download_speed', minSpeed)
    }

    if (maxPrice > 0) {
      query = query.lte('monthly_price', maxPrice)
    }

    // Apply sorting
    const validSortFields = ['monthly_price', 'typical_download_speed', 'provider_name', 'service_plan_name']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'monthly_price'
    query = query.order(sortField, { ascending: sortOrder === 'asc', nullsFirst: false })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: plans, error, count } = await query

    if (error) {
      console.error('Plans API error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch plans' },
        { status: 500 }
      )
    }

    // Transform plans for API response
    const transformedPlans = (plans || []).map(plan => ({
      id: plan.id,
      fccPlanId: plan.fcc_plan_id,
      providerName: plan.provider_name,
      providerId: plan.provider_id,
      planName: plan.service_plan_name,
      tierName: plan.tier_plan_name,
      connectionType: plan.connection_type,
      serviceType: plan.service_type,
      pricing: {
        monthlyPrice: plan.monthly_price,
        hasIntroRate: plan.has_intro_rate,
        introPrice: plan.intro_rate_price,
        introMonths: plan.intro_rate_months,
      },
      contract: {
        required: plan.contract_required,
        months: plan.contract_months,
        earlyTerminationFee: plan.early_termination_fee,
      },
      fees: {
        oneTime: plan.one_time_fees,
        monthly: plan.monthly_fees,
        taxInfo: plan.tax_info,
      },
      speeds: {
        download: plan.typical_download_speed,
        upload: plan.typical_upload_speed,
        latency: plan.typical_latency,
      },
      data: {
        monthlyAllowanceGb: plan.monthly_data_gb,
        overagePrice: plan.overage_price_per_gb,
        isUnlimited: plan.monthly_data_gb === null,
      },
      support: {
        phone: plan.support_phone,
        url: plan.support_url,
      },
      dataSource: plan.data_source,
    }))

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      plans: transformedPlans,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Plans API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
