import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams
    const zipCode = searchParams.get('zip')

    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { success: false, error: 'Valid 5-digit ZIP code required' },
        { status: 400 }
      )
    }

    // Get coverage records for this ZIP
    const { data: coverageData, error: coverageError } = await supabase
      .from('coverage')
      .select('provider_id')
      .eq('zip_code', zipCode)
      .eq('has_service', true)

    if (coverageError) {
      console.error('Coverage error:', coverageError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch coverage data' },
        { status: 500 }
      )
    }

    if (!coverageData || coverageData.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          zipCode,
          providers: [],
          message: 'No providers found for this ZIP code'
        }
      })
    }

    // Get unique provider IDs
    const providerIds = [...new Set(coverageData.map(c => c.provider_id))]

    // Get provider details
    const { data: providers, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .in('id', providerIds)

    if (providerError) {
      console.error('Provider error:', providerError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch provider data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        zipCode,
        providers: providers || [],
        count: providers?.length || 0
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
