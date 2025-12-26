'use client'

import { useLocation } from '@/contexts/LocationContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatedToggle } from '@/components/ui'

interface LocationAwareRankingsProps {
  technology: 'Cable' | 'Fiber' | 'DSL' | '5G' | 'Satellite'
  currentZip?: string
  cityName?: string | null
  isFiltered: boolean
  providerCount: number
}

export function LocationAwareRankings({
  technology,
  currentZip,
  cityName,
  isFiltered,
  providerCount,
}: LocationAwareRankingsProps) {
  const { location, isLoading } = useLocation()
  const router = useRouter()
  const pathname = usePathname()
  const [hasRedirected, setHasRedirected] = useState(false)
  const [showLocalOnly, setShowLocalOnly] = useState(true)

  // Auto-redirect when location is available and we haven't filtered yet
  useEffect(() => {
    if (!isLoading && location?.zipCode && !currentZip && !hasRedirected && showLocalOnly) {
      // Use timeout to satisfy lint (setState in callback)
      const timer = setTimeout(() => {
        setHasRedirected(true)
        router.push(`${pathname}?zip=${location.zipCode}`)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isLoading, location?.zipCode, currentZip, hasRedirected, router, pathname, showLocalOnly])

  // Handle toggle change
  const handleToggle = (checked: boolean) => {
    if (checked && location?.zipCode) {
      // Switch to showing local providers
      setShowLocalOnly(true)
      router.push(`${pathname}?zip=${location.zipCode}`)
    } else {
      // Switch to showing all providers (remove zip param)
      setShowLocalOnly(false)
      router.push(pathname)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-400">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Detecting your location...
      </div>
    )
  }

  // Show toggle when we have location info
  if (location?.zipCode) {
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className={`text-sm ${!isFiltered ? 'text-white font-medium' : 'text-gray-500'}`}>
            All Providers
          </span>
          <AnimatedToggle
            checked={isFiltered}
            onChange={handleToggle}
            activeColor="cyan"
          />
          <span className={`text-sm ${isFiltered ? 'text-white font-medium' : 'text-gray-500'}`}>
            My Area
          </span>
        </div>

        {/* Location Info */}
        {isFiltered && currentZip ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-800/50 rounded-full text-sm">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-green-300">
              {cityName ? `${cityName} (${currentZip})` : `ZIP ${currentZip}`}
            </span>
            <span className="text-green-400 font-medium">
              • {providerCount} {technology.toLowerCase()} {providerCount === 1 ? 'provider' : 'providers'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-400">
            <span>Showing all {technology.toLowerCase()} providers nationwide</span>
          </div>
        )}
      </div>
    )
  }

  // If we have location but not filtered and showLocalOnly (should auto-redirect)
  if (location?.zipCode && !currentZip && showLocalOnly) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-400">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading {technology.toLowerCase()} providers for {location.city || `ZIP ${location.zipCode}`}...
      </div>
    )
  }

  // No location - show prompt
  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Showing all {technology.toLowerCase()} providers nationwide</span>
      </div>
      <Link
        href="/compare"
        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        Enter ZIP for local results
      </Link>
    </div>
  )
}
