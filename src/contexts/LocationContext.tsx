'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface Location {
  city: string | null
  region: string | null
  regionCode: string | null
  zipCode: string | null
  latitude: number | null
  longitude: number | null
  source: 'ip' | 'gps' | 'manual' | 'address'
  h3Index?: string | null
}

// H3 Availability data from FCC
export interface H3Provider {
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

export interface H3Availability {
  h3Index: string
  providers: H3Provider[]
  summary: {
    totalProviders: number
    hasFiber: boolean
    hasCable: boolean
    hasFixedWireless: boolean
    hasSatellite: boolean
    maxDownloadSpeed: number
    maxUploadSpeed: number
  }
  address?: {
    matched: string
    components: {
      city: string
      state: string
      zip: string
    }
  } | null
}

interface LocationContextType {
  location: Location | null
  isLoading: boolean
  error: string | null
  h3Availability: H3Availability | null
  isLoadingH3: boolean
  detectFromIP: () => Promise<void>
  detectFromGPS: () => Promise<void>
  setManualZip: (zipCode: string) => void
  setAddressLocation: (address: string) => Promise<boolean>
  clearLocation: () => void
  fetchH3Availability: (lat: number, lng: number) => Promise<H3Availability | null>
}

const LocationContext = createContext<LocationContextType | null>(null)

const STORAGE_KEY = 'user_location'

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [h3Availability, setH3Availability] = useState<H3Availability | null>(null)
  const [isLoadingH3, setIsLoadingH3] = useState(false)

  // Fetch H3 availability from FCC data
  const fetchH3Availability = useCallback(async (lat: number, lng: number): Promise<H3Availability | null> => {
    setIsLoadingH3(true)
    try {
      const response = await fetch(`/api/availability?lat=${lat}&lng=${lng}`)
      const data = await response.json()

      if (data.success && data.data) {
        const availability: H3Availability = {
          h3Index: data.data.h3Index,
          providers: data.data.providers,
          summary: data.data.summary,
          address: data.data.address,
        }
        setH3Availability(availability)
        return availability
      }
      return null
    } catch (err) {
      console.error('Failed to fetch H3 availability:', err)
      return null
    } finally {
      setIsLoadingH3(false)
    }
  }, [])

  // Set location from address string (geocodes and fetches availability)
  const setAddressLocation = useCallback(async (address: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/availability?address=${encodeURIComponent(address)}`)
      const data = await response.json()

      if (data.success && data.data) {
        // Update location with geocoded address
        setLocation({
          city: data.data.address?.components?.city || null,
          region: data.data.address?.components?.state || null,
          regionCode: data.data.address?.components?.state || null,
          zipCode: data.data.address?.components?.zip || null,
          latitude: data.data.coordinates?.lat || null,
          longitude: data.data.coordinates?.lng || null,
          source: 'address',
          h3Index: data.data.h3Index,
        })

        // Set H3 availability
        setH3Availability({
          h3Index: data.data.h3Index,
          providers: data.data.providers,
          summary: data.data.summary,
          address: data.data.address,
        })

        return true
      } else {
        setError(data.error || 'Could not find address')
        return false
      }
    } catch {
      setError('Failed to lookup address')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Try to upgrade to GPS location in background (doesn't show loading state)
  const tryGPSUpgrade = useCallback(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(`/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`)
          const data = await response.json()

          if (data.success && data.location?.zipCode) {
            setLocation({
              city: data.location.city,
              region: data.location.region,
              regionCode: data.location.regionCode,
              zipCode: data.location.zipCode,
              latitude: data.location.latitude,
              longitude: data.location.longitude,
              source: 'gps',
            })

            // Also fetch H3 availability in background when we have GPS
            fetchH3Availability(latitude, longitude)
          }
        } catch {
          // Silently fail - keep IP location
        }
      },
      () => {
        // User denied or error - silently fail, keep IP location
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [fetchH3Availability])

  // Try to detect from IP first, then automatically try GPS
  const detectFromIPThenGPS = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Start IP detection
      const ipResponse = await fetch('/api/location')
      const ipData = await ipResponse.json()

      if (ipData.success && ipData.location) {
        // Set IP location immediately
        setLocation({
          city: ipData.location.city,
          region: ipData.location.region,
          regionCode: ipData.location.regionCode,
          zipCode: ipData.location.zipCode,
          latitude: ipData.location.latitude,
          longitude: ipData.location.longitude,
          source: 'ip',
        })
      }
      setIsLoading(false)

      // Try GPS upgrade in background
      tryGPSUpgrade()
    } catch {
      setError('Failed to detect location')
      setIsLoading(false)
    }
  }, [tryGPSUpgrade])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsedLocation = JSON.parse(stored)
        setLocation(parsedLocation)
        // If stored location is IP-based, try to upgrade to GPS in background
        if (parsedLocation.source === 'ip') {
          tryGPSUpgrade()
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    } else {
      // Auto-detect from IP on first visit, then try GPS
      detectFromIPThenGPS()
    }
  }, [detectFromIPThenGPS, tryGPSUpgrade])

  // Save to localStorage when location changes
  useEffect(() => {
    if (location) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(location))
    }
  }, [location])

  const detectFromIP = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/location')
      const data = await response.json()

      if (data.success && data.location) {
        setLocation({
          city: data.location.city,
          region: data.location.region,
          regionCode: data.location.regionCode,
          zipCode: data.location.zipCode,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          source: 'ip',
        })
      } else {
        setError('Could not detect location from IP')
      }
    } catch {
      setError('Failed to detect location')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const detectFromGPS = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        })
      })

      const { latitude, longitude } = position.coords

      // Reverse geocode to get ZIP
      const response = await fetch(`/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`)
      const data = await response.json()

      if (data.success && data.location) {
        setLocation({
          city: data.location.city,
          region: data.location.region,
          regionCode: data.location.regionCode,
          zipCode: data.location.zipCode,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          source: 'gps',
        })
      } else {
        setError('Could not determine ZIP code from GPS')
      }
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable')
            break
          case err.TIMEOUT:
            setError('Location request timed out')
            break
        }
      } else {
        setError('Failed to get GPS location')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setManualZip = useCallback((zipCode: string) => {
    if (/^\d{5}$/.test(zipCode)) {
      setLocation(prev => ({
        city: prev?.city || null,
        region: prev?.region || null,
        regionCode: prev?.regionCode || null,
        zipCode,
        latitude: prev?.latitude || null,
        longitude: prev?.longitude || null,
        source: 'manual',
      }))
      setError(null)
    }
  }, [])

  const clearLocation = useCallback(() => {
    setLocation(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        h3Availability,
        isLoadingH3,
        detectFromIP,
        detectFromGPS,
        setManualZip,
        setAddressLocation,
        clearLocation,
        fetchH3Availability,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}
