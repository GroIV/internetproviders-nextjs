import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { latLngToCell } from 'h3-js'

// Census Bureau Geocoder - Free, no API key required
interface GeocodedAddress {
  matchedAddress: string
  coordinates: { lat: number; lng: number }
  addressComponents: {
    streetAddress: string
    city: string
    state: string
    zip: string
  }
}

async function geocodeAddress(address: string): Promise<GeocodedAddress | null> {
  try {
    // Use Census Bureau's One Line Address geocoder
    const encodedAddress = encodeURIComponent(address)
    const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodedAddress}&benchmark=Public_AR_Current&format=json`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'InternetProvidersAI/1.0' },
    })

    if (!response.ok) {
      console.error('Geocoder response not ok:', response.status)
      return null
    }

    const data = await response.json()

    // Check if we got a match
    const matches = data?.result?.addressMatches
    if (!matches || matches.length === 0) {
      return null
    }

    const match = matches[0]
    return {
      matchedAddress: match.matchedAddress,
      coordinates: {
        lat: match.coordinates.y,
        lng: match.coordinates.x,
      },
      addressComponents: {
        streetAddress: match.addressComponents?.streetName
          ? `${match.addressComponents.fromAddress || ''} ${match.addressComponents.preDirection || ''} ${match.addressComponents.streetName} ${match.addressComponents.suffixType || ''} ${match.addressComponents.suffixDirection || ''}`.trim().replace(/\s+/g, ' ')
          : '',
        city: match.addressComponents?.city || '',
        state: match.addressComponents?.state || '',
        zip: match.addressComponents?.zip || '',
      },
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Technology code to name mapping (FCC BDC codes)
const TECHNOLOGY_MAP: Record<number, string> = {
  10: 'DSL',
  40: 'Cable',
  50: 'Fiber',
  60: 'Satellite',      // GSO Satellite
  61: 'Satellite',      // NGSO Satellite (Starlink, etc.)
  70: 'Fixed Wireless', // Unlicensed
  71: 'Fixed Wireless', // Licensed
  72: 'Fixed Wireless', // LBR
}

// More specific technology names for detailed view
const TECHNOLOGY_DETAIL_MAP: Record<number, string> = {
  10: 'DSL (Copper)',
  40: 'Cable (DOCSIS)',
  50: 'Fiber to the Premises',
  60: 'Satellite (GSO)',
  61: 'Satellite (LEO/NGSO)',
  70: 'Fixed Wireless (Unlicensed)',
  71: 'Fixed Wireless (Licensed)',
  72: 'Fixed Wireless (LBR)',
}

interface H3AvailabilityRow {
  h3_res8_id: string
  provider_id: string
  technology: number
  brand_name: string
  max_down: number
  max_up: number
  location_count: number
  low_latency: boolean
  state_usps: string
}

interface ProviderResult {
  providerId: string
  brandName: string
  technology: string
  technologyCode: number
  technologyDetail: string
  maxDownload: number
  maxUpload: number
  lowLatency: boolean
  locationCount: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const searchParams = request.nextUrl.searchParams

    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const h3Direct = searchParams.get('h3') // Allow direct H3 lookup
    const address = searchParams.get('address') // Street address input

    let h3Index: string
    let geocodedData: GeocodedAddress | null = null
    let coordinates: { lat: number; lng: number } | null = null

    if (h3Direct) {
      // Direct H3 index provided
      h3Index = h3Direct
    } else if (address) {
      // Geocode the street address
      geocodedData = await geocodeAddress(address)

      if (!geocodedData) {
        return NextResponse.json(
          {
            success: false,
            error: 'Could not find address. Please enter a valid US street address.',
            suggestion: 'Try including city and state, e.g., "123 Main St, Austin, TX"'
          },
          { status: 400 }
        )
      }

      coordinates = geocodedData.coordinates
      h3Index = latLngToCell(coordinates.lat, coordinates.lng, 8)
    } else if (lat && lng) {
      // Convert lat/lng to H3
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lng)

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { success: false, error: 'Invalid latitude or longitude values' },
          { status: 400 }
        )
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return NextResponse.json(
          { success: false, error: 'Coordinates out of range' },
          { status: 400 }
        )
      }

      coordinates = { lat: latitude, lng: longitude }
      h3Index = latLngToCell(latitude, longitude, 8)
    } else {
      return NextResponse.json(
        { success: false, error: 'Address, lat/lng, or h3 parameter required' },
        { status: 400 }
      )
    }

    // Query the h3_availability table
    const { data, error } = await supabase
      .from('h3_availability')
      .select('*')
      .eq('h3_res8_id', h3Index)
      .order('max_down', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch availability data' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          h3Index,
          providers: [],
          summary: {
            totalProviders: 0,
            hasFiber: false,
            hasCable: false,
            hasFixedWireless: false,
            hasSatellite: false,
            maxDownloadSpeed: 0,
          },
          message: 'No provider data found for this location'
        }
      })
    }

    // Transform the results
    const providers: ProviderResult[] = (data as H3AvailabilityRow[]).map(row => ({
      providerId: row.provider_id,
      brandName: row.brand_name,
      technology: TECHNOLOGY_MAP[row.technology] || 'Unknown',
      technologyCode: row.technology,
      technologyDetail: TECHNOLOGY_DETAIL_MAP[row.technology] || 'Unknown',
      maxDownload: row.max_down,
      maxUpload: row.max_up,
      lowLatency: row.low_latency,
      locationCount: row.location_count,
    }))

    // Build summary stats
    const techCodes = new Set(data.map((r: H3AvailabilityRow) => r.technology))
    const uniqueProviders = new Set(data.map((r: H3AvailabilityRow) => r.provider_id))

    const summary = {
      totalProviders: uniqueProviders.size,
      totalOptions: providers.length, // Provider + technology combinations
      hasFiber: techCodes.has(50),
      hasCable: techCodes.has(40),
      hasDSL: techCodes.has(10),
      hasFixedWireless: techCodes.has(70) || techCodes.has(71) || techCodes.has(72),
      hasSatellite: techCodes.has(60) || techCodes.has(61),
      maxDownloadSpeed: Math.max(...data.map((r: H3AvailabilityRow) => r.max_down)),
      maxUploadSpeed: Math.max(...data.map((r: H3AvailabilityRow) => r.max_up)),
      state: data[0]?.state_usps || null,
    }

    // Group providers by technology for easier consumption
    const byTechnology: Record<string, ProviderResult[]> = {}
    for (const provider of providers) {
      const tech = provider.technology
      if (!byTechnology[tech]) {
        byTechnology[tech] = []
      }
      byTechnology[tech].push(provider)
    }

    return NextResponse.json({
      success: true,
      data: {
        h3Index,
        coordinates,
        address: geocodedData ? {
          input: address,
          matched: geocodedData.matchedAddress,
          components: geocodedData.addressComponents,
        } : null,
        providers,
        byTechnology,
        summary,
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
