import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Latitude and longitude required' },
        { status: 400 }
      )
    }

    // Use BigDataCloud free reverse geocoding API
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    )

    if (!response.ok) {
      throw new Error('Reverse geocoding service unavailable')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data: {
        city: data.city || data.locality || null,
        region: data.principalSubdivision || null,
        regionCode: data.principalSubdivisionCode?.replace('US-', '') || null,
        country: data.countryName || null,
        countryCode: data.countryCode || null,
        zipCode: data.postcode || null,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      },
    })
  } catch (error) {
    console.error('Reverse geocode error:', error)
    return NextResponse.json({
      success: false,
      error: 'Could not reverse geocode location',
    })
  }
}
