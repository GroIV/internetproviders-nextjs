import { NextRequest, NextResponse } from 'next/server'
import { getProvidersByZip } from '@/lib/getProvidersByLocation'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const zipCode = searchParams.get('zip')
    const technology = searchParams.get('technology') as 'Fiber' | 'Cable' | 'DSL' | '5G' | 'Satellite' | 'Fixed Wireless' | undefined

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { success: false, error: 'Valid 5-digit ZIP code required' },
        { status: 400 }
      )
    }

    const providers = await getProvidersByZip(zipCode, technology)

    return NextResponse.json({
      success: true,
      data: {
        zipCode,
        providers,
        count: providers.length
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
