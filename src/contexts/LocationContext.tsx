'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface Location {
  city: string | null
  region: string | null
  regionCode: string | null
  zipCode: string | null
  latitude: number | null
  longitude: number | null
  source: 'ip' | 'gps' | 'manual'
}

interface LocationContextType {
  location: Location | null
  isLoading: boolean
  error: string | null
  detectFromIP: () => Promise<void>
  detectFromGPS: () => Promise<void>
  setManualZip: (zipCode: string) => void
  clearLocation: () => void
}

const LocationContext = createContext<LocationContextType | null>(null)

const STORAGE_KEY = 'user_location'

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setLocation(JSON.parse(stored))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    } else {
      // Auto-detect from IP on first visit
      detectFromIP()
    }
  }, [])

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
    } catch (err) {
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
        detectFromIP,
        detectFromGPS,
        setManualZip,
        clearLocation,
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
