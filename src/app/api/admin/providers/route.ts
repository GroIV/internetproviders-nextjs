import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/providers - Get all providers with stats
export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get providers with plan counts
    const { data: providers, error } = await supabase
      .from('providers')
      .select(`
        id,
        name,
        slug,
        category,
        technologies,
        created_at,
        updated_at
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching providers:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch providers' },
        { status: 500 }
      )
    }

    // Get plan counts per provider
    const { data: planCounts } = await supabase
      .from('plans')
      .select('provider_id')

    const planCountMap = new Map<number, number>()
    if (planCounts) {
      for (const plan of planCounts) {
        planCountMap.set(plan.provider_id, (planCountMap.get(plan.provider_id) || 0) + 1)
      }
    }

    // Enrich providers with plan counts
    const enrichedProviders = (providers || []).map(p => ({
      ...p,
      plans_count: planCountMap.get(p.id) || 0,
    }))

    // Calculate stats
    const total = enrichedProviders.length
    const withPlans = enrichedProviders.filter(p => p.plans_count > 0).length

    // Technology counts
    const technologies: Record<string, number> = {}
    for (const provider of enrichedProviders) {
      if (provider.technologies && Array.isArray(provider.technologies)) {
        for (const tech of provider.technologies) {
          technologies[tech] = (technologies[tech] || 0) + 1
        }
      }
    }

    return NextResponse.json({
      success: true,
      providers: enrichedProviders,
      stats: {
        total,
        withPlans,
        technologies,
      },
    })
  } catch (error) {
    console.error('Providers API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get providers' },
      { status: 500 }
    )
  }
}
