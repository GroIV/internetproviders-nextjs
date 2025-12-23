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

    // Get broadband coverage data for this ZIP from FCC data
    const { data: coverageData, error: coverageError } = await supabase
      .from('zip_broadband_coverage')
      .select('*')
      .eq('zip_code', zipCode)
      .single()

    if (coverageError && coverageError.code !== 'PGRST116') {
      console.error('Coverage error:', coverageError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch coverage data' },
        { status: 500 }
      )
    }

    if (!coverageData) {
      return NextResponse.json({
        success: true,
        data: {
          zipCode,
          city: null,
          coverage: null,
          message: 'No coverage data found for this ZIP code'
        }
      })
    }

    // Format coverage percentages as human-readable
    const formatPercent = (val: number | null) =>
      val !== null ? Math.round(val * 100) : null

    return NextResponse.json({
      success: true,
      data: {
        zipCode,
        city: coverageData.city,
        totalHousingUnits: coverageData.total_housing_units,
        coverage: {
          // Any Technology (any broadband)
          anyTechnology: {
            speed25_3: formatPercent(coverageData.any_25_3),
            speed100_20: formatPercent(coverageData.any_100_20),
            speed1000_100: formatPercent(coverageData.any_1000_100),
          },
          // Fiber
          fiber: {
            speed25_3: formatPercent(coverageData.fiber_25_3),
            speed100_20: formatPercent(coverageData.fiber_100_20),
            speed1000_100: formatPercent(coverageData.fiber_1000_100),
          },
          // Cable
          cable: {
            speed25_3: formatPercent(coverageData.cable_25_3),
            speed100_20: formatPercent(coverageData.cable_100_20),
            speed1000_100: formatPercent(coverageData.cable_1000_100),
          },
          // Fixed Wireless
          fixedWireless: {
            speed25_3: formatPercent(coverageData.fixed_wireless_25_3),
            speed100_20: formatPercent(coverageData.fixed_wireless_100_20),
          },
        },
        dataSource: coverageData.data_source,
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
