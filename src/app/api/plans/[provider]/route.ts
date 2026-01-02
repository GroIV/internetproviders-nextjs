import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ provider: string }>
}

// Type for broadband plan from Supabase
interface BroadbandPlan {
  id: number
  fcc_plan_id: string
  service_plan_name: string
  tier_plan_name: string | null
  connection_type: string
  service_type: string
  monthly_price: number
  has_intro_rate: boolean
  intro_rate_price: number | null
  typical_download_speed: number
  typical_upload_speed: number | null
  typical_latency: number | null
  monthly_data_gb: number | null
  contract_required: boolean
  one_time_fees: number | null
  monthly_fees: number | null
  support_phone: string | null
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

    // Build query for plans - exclude subsidized/low-income and upgrade plans
    let query = supabase
      .from('broadband_plans')
      .select('*')
      .eq('provider_id', providerData.id)
      .eq('is_active', true)
      .eq('service_type', serviceType || 'residential')  // Default to residential
      .gte('monthly_price', 30)  // Exclude bundle add-on prices (Xfinity has $20 bundle pricing)
      .gt('typical_download_speed', 0)  // Must have speed data
      // Exclude low-income/subsidized programs
      .not('service_plan_name', 'ilike', '%Internet Assist%')
      .not('service_plan_name', 'ilike', 'Access from AT&T%')
      .not('service_plan_name', 'ilike', '%Internet Essentials%')
      .not('service_plan_name', 'ilike', '%Lifeline%')
      .not('service_plan_name', 'ilike', '%ACP%')
      .not('service_plan_name', 'ilike', '%ASSIST%')
      // Exclude upgrade add-ons
      .not('service_plan_name', 'ilike', '%Upgrade%')
      // Exclude non-home-internet plans
      .not('service_plan_name', 'ilike', 'Access for%')
      .not('service_plan_name', 'ilike', '%Accessibility Plan%')
      .not('service_plan_name', 'ilike', '%By the Gig%')
      .not('service_plan_name', 'ilike', '%Hibernation%')
      .not('service_plan_name', 'ilike', '%Tablet%')
      .not('service_plan_name', 'ilike', '%Prepaid%')
      .not('service_plan_name', 'ilike', '%FirstNet%')
      .not('service_plan_name', 'ilike', '%OnStar%')
      .not('service_plan_name', 'ilike', '%Audi%')
      .not('service_plan_name', 'ilike', '%Connected Car%')
      .not('service_plan_name', 'ilike', '%Camera%')
      .not('service_plan_name', 'ilike', '%Wearable%')
      // Exclude business/education plans
      .not('service_plan_name', 'ilike', '%eRate%')
      .not('service_plan_name', 'ilike', '%Business%')
      // Exclude backup/secondary and sub-brand plans
      .not('service_plan_name', 'ilike', '%Backup%')
      .not('service_plan_name', 'ilike', 'Mint %')

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

    // Type the plans as BroadbandPlan[]
    const typedPlans = (plans || []) as BroadbandPlan[]

    // Group plans by service type
    const residentialPlans = typedPlans.filter(p => p.service_type === 'residential')
    const mobilePlans = typedPlans.filter(p => p.service_type === 'mobile')

    // Find best value (lowest price with decent speed)
    const findBestValue = (planList: BroadbandPlan[]): BroadbandPlan | null => {
      if (planList.length === 0) return null
      return planList.reduce((best, plan) => {
        const score = (plan.typical_download_speed || 0) / (plan.monthly_price || 1)
        const bestScore = (best.typical_download_speed || 0) / (best.monthly_price || 1)
        return score > bestScore ? plan : best
      })
    }

    // Transform plans
    const transformPlan = (plan: BroadbandPlan) => ({
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
        totalPlans: typedPlans.length,
        residentialPlans: residentialPlans.length,
        mobilePlans: mobilePlans.length,
        priceRange: {
          min: Math.min(...typedPlans.map(p => p.monthly_price)),
          max: Math.max(...typedPlans.map(p => p.monthly_price)),
        },
        speedRange: {
          min: Math.min(...typedPlans.filter(p => p.typical_download_speed).map(p => p.typical_download_speed)),
          max: Math.max(...typedPlans.filter(p => p.typical_download_speed).map(p => p.typical_download_speed)),
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
