import { NextRequest, NextResponse } from 'next/server'
import { getProvidersByZip } from '@/lib/getProvidersByLocation'
import { getPlanStatsForProviders } from '@/lib/getPlansForZip'

// Fallback estimates when we don't have real FCC data
// These are advertised starting prices and max speeds
const FALLBACK_ESTIMATES: Record<string, { price: number; speed: number }> = {
  'att-internet': { price: 55, speed: 5000 },
  'xfinity': { price: 30, speed: 2000 },
  'spectrum': { price: 50, speed: 1000 },
  'verizon-fios': { price: 50, speed: 2300 },
  'verizon-5g': { price: 50, speed: 300 },
  'google-fiber': { price: 70, speed: 8000 },
  'frontier': { price: 50, speed: 5000 },
  'frontier-fiber': { price: 50, speed: 5000 },
  'cox': { price: 50, speed: 2000 },
  't-mobile': { price: 50, speed: 245 },
  'starlink': { price: 120, speed: 220 },
  'viasat': { price: 70, speed: 150 },
  'hughesnet': { price: 50, speed: 100 },
  'centurylink': { price: 50, speed: 940 },
  'optimum': { price: 40, speed: 8000 },
  'metronet': { price: 50, speed: 5000 },
  'ziply-fiber': { price: 20, speed: 5000 },
  'brightspeed': { price: 50, speed: 2000 },
  'windstream': { price: 40, speed: 2000 },
  'earthlink': { price: 50, speed: 5000 },
  'wow': { price: 40, speed: 1000 },
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const zipCode = searchParams.get('zip')
    const limit = parseInt(searchParams.get('limit') || '8', 10)

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { success: false, error: 'Valid 5-digit ZIP code required' },
        { status: 400 }
      )
    }

    // Fetch providers first
    const providers = await getProvidersByZip(zipCode)

    // Map provider slugs to broadband_plans provider names
    const providerNameMap: Record<string, string> = {
      'att-internet': 'AT&T',
      'xfinity': 'Xfinity',
      'spectrum': 'Spectrum',
      'verizon-fios': 'Verizon Fios',
      'verizon-5g': 'Verizon Fios',
      'google-fiber': 'Google Fiber',
      'frontier': 'Frontier',
      'frontier-fiber': 'Frontier',
      'cox': 'Cox',
      't-mobile': 'T-Mobile',
      'starlink': 'Starlink',
      'viasat': 'Viasat',
      'hughesnet': 'HughesNet',
      'centurylink': 'CenturyLink',
      'optimum': 'Optimum',
      'metronet': 'Metronet',
      'ziply-fiber': 'Ziply Fiber',
      'brightspeed': 'Brightspeed',
      'windstream': 'Windstream',
      'wow': 'WOW!',
    }

    // Get provider names we need to look up
    const providerNames = providers
      .slice(0, limit)
      .map(p => providerNameMap[p.slug])
      .filter(Boolean)

    // Get aggregated plan stats using SQL aggregation (handles large datasets)
    const plansByProvider = await getPlanStatsForProviders([...new Set(providerNames)])

    // Return top providers with plan data (real or fallback)
    const topProviders = providers.slice(0, limit).map(p => {
      const realData = plansByProvider.get(p.slug)
      const fallback = FALLBACK_ESTIMATES[p.slug]

      // Use real data if available, otherwise use fallback estimates
      const hasRealData = realData && realData.planCount > 0

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        technologies: p.technologies,
        category: p.category,
        coveragePercent: p.coveragePercent,
        // Plan data - real or estimated
        startingPrice: hasRealData ? realData.minPrice : (fallback?.price || null),
        maxSpeed: hasRealData ? realData.maxSpeed : (fallback?.speed || null),
        planCount: realData?.planCount || 0,
        isEstimate: !hasRealData && !!fallback, // Flag to indicate estimate vs real data
      }
    })

    return NextResponse.json({
      success: true,
      providers: topProviders,
      total: providers.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    })
  } catch (error) {
    console.error('Provider list API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}
