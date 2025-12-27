/* eslint-disable @typescript-eslint/no-explicit-any */
// API route uses dynamic Supabase response types
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ provider: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const supabase = createAdminClient()
    const { provider: providerSlug } = await params
    const searchParams = request.nextUrl.searchParams

    const serviceType = searchParams.get('serviceType')
    const sortBy = searchParams.get('sortBy') || 'monthly_price'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Get provider info
    const { data: providerData } = await supabase
      .from('providers')
      .select('id, name, slug, technologies, category')
      .eq('slug', providerSlug)
      .single()

    if (!providerData) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Build query for plans
    let query = supabase
      .from('broadband_plans')
      .select('*')
      .eq('provider_id', providerData.id)
      .eq('is_active', true)

    if (serviceType) {
      query = query.eq('service_type', serviceType)
    }

    // Apply sorting
    const validSortFields = ['monthly_price', 'typical_download_speed', 'service_plan_name']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'monthly_price'
    query = query.order(sortField, { ascending: sortOrder === 'asc', nullsFirst: false })

    const { data: plans, error } = await query

    if (error) {
      console.error('Provider plans API error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch plans' },
        { status: 500 }
      )
    }

    // Group plans by service type
    const residentialPlans = (plans || []).filter(p => p.service_type === 'residential')
    const mobilePlans = (plans || []).filter(p => p.service_type === 'mobile')

    // Find best value (lowest price with decent speed)
    const findBestValue = (planList: typeof plans) => {
      if (!planList || planList.length === 0) return null
      return planList.reduce((best, plan) => {
        const score = (plan.typical_download_speed || 0) / (plan.monthly_price || 1)
        const bestScore = (best.typical_download_speed || 0) / (best.monthly_price || 1)
        return score > bestScore ? plan : best
      })
    }

    // Transform plans
    const transformPlan = (plan: any) => ({
      id: plan.id,
      fccPlanId: plan.fcc_plan_id,
      planName: plan.service_plan_name,
      tierName: plan.tier_plan_name,
      connectionType: plan.connection_type,
      serviceType: plan.service_type,
      monthlyPrice: plan.monthly_price,
      hasIntroRate: plan.has_intro_rate,
      introPrice: plan.intro_rate_price,
      downloadSpeed: plan.typical_download_speed,
      uploadSpeed: plan.typical_upload_speed,
      latency: plan.typical_latency,
      dataGb: plan.monthly_data_gb,
      isUnlimited: plan.monthly_data_gb === null,
      contractRequired: plan.contract_required,
      oneTimeFees: plan.one_time_fees,
      monthlyFees: plan.monthly_fees,
      supportPhone: plan.support_phone,
    })

    const bestResidential = findBestValue(residentialPlans)

    return NextResponse.json({
      success: true,
      provider: {
        id: providerData.id,
        name: providerData.name,
        slug: providerData.slug,
        technologies: providerData.technologies,
        category: providerData.category,
      },
      summary: {
        totalPlans: (plans || []).length,
        residentialPlans: residentialPlans.length,
        mobilePlans: mobilePlans.length,
        priceRange: {
          min: Math.min(...(plans || []).map(p => p.monthly_price)),
          max: Math.max(...(plans || []).map(p => p.monthly_price)),
        },
        speedRange: {
          min: Math.min(...(plans || []).filter(p => p.typical_download_speed).map(p => p.typical_download_speed)),
          max: Math.max(...(plans || []).filter(p => p.typical_download_speed).map(p => p.typical_download_speed)),
        },
        bestValue: bestResidential ? transformPlan(bestResidential) : null,
      },
      plans: {
        residential: residentialPlans.map(transformPlan),
        mobile: mobilePlans.map(transformPlan),
      },
    })
  } catch (error) {
    console.error('Provider plans API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
