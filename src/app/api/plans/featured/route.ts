import { NextRequest, NextResponse } from 'next/server'
import {
  featuredPlans,
  getFeaturedPlansForProvider,
  getAllFeaturedPlans,
  getBestValuePlans
} from '@/lib/featuredPlans'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const provider = searchParams.get('provider')
    const tier = searchParams.get('tier') // budget, value, premium
    const bestValue = searchParams.get('bestValue') === 'true'

    // If requesting best value plans
    if (bestValue) {
      const valuePlans = getBestValuePlans()
      return NextResponse.json({
        success: true,
        plans: valuePlans,
        description: 'Best value plans ranked by speed per dollar'
      })
    }

    // If requesting specific provider
    if (provider) {
      const providerPlans = getFeaturedPlansForProvider(provider)
      if (!providerPlans) {
        return NextResponse.json(
          { success: false, error: 'Provider not found' },
          { status: 404 }
        )
      }

      let plans = providerPlans.plans
      if (tier) {
        plans = plans.filter(p => p.tier === tier)
      }

      return NextResponse.json({
        success: true,
        provider: {
          name: providerPlans.providerName,
          slug: providerPlans.slug
        },
        plans,
        notes: providerPlans.notes
      })
    }

    // If filtering by tier across all providers
    if (tier) {
      const allPlans = getAllFeaturedPlans().filter(p => p.tier === tier)
      return NextResponse.json({
        success: true,
        tier,
        plans: allPlans
      })
    }

    // Return all featured plans
    return NextResponse.json({
      success: true,
      providers: featuredPlans.map(p => ({
        name: p.providerName,
        slug: p.slug,
        planCount: p.plans.length,
        priceRange: {
          min: Math.min(...p.plans.map(plan => plan.price)),
          max: Math.max(...p.plans.map(plan => plan.price))
        },
        plans: p.plans,
        notes: p.notes
      })),
      summary: {
        totalProviders: featuredPlans.length,
        totalPlans: featuredPlans.reduce((sum, p) => sum + p.plans.length, 0),
        bestOverallValue: getBestValuePlans()[0]
      }
    })
  } catch (error) {
    console.error('Featured plans API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
