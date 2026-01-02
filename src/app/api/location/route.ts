import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the client IP from headers (Vercel/Cloudflare provide this)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || ''

    // Use ipapi.co for free IP geolocation (1000 req/day free)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'InternetProvidersAI/1.0',
      },
    })

    if (!response.ok) {
      throw new Error('Geolocation service unavailable')
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.reason || 'Could not determine location')
    }

    return NextResponse.json({
      success: true,
      data: {
        ip: ip || 'unknown',
        city: data.city || null,
        region: data.region || null,
        regionCode: data.region_code || null,
        country: data.country_name || null,
        countryCode: data.country_code || null,
        zipCode: data.postal || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        timezone: data.timezone || null,
        isp: data.org || null,
      },
    })
  } catch (error) {
    console.error('Location API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Could not determine location',
    })
  }
}
