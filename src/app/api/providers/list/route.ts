import { NextRequest, NextResponse } from 'next/server'
import { getProvidersByZip } from '@/lib/getProvidersByLocation'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const zipCode = searchParams.get('zip')
    const limit = parseInt(searchParams.get('limit') || '6', 10)

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { success: false, error: 'Valid 5-digit ZIP code required' },
        { status: 400 }
      )
    }

    const providers = await getProvidersByZip(zipCode)

    // Return top providers with their info
    const topProviders = providers.slice(0, limit).map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      technologies: p.technologies,
      category: p.category,
      coveragePercent: p.coveragePercent,
    }))

    return NextResponse.json({
      success: true,
      providers: topProviders,
      total: providers.length,
    })
  } catch (error) {
    console.error('Provider list API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}
