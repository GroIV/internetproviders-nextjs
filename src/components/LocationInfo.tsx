'use client'

import Link from 'next/link'
import { useLocation } from '@/contexts/LocationContext'

interface LocationInfoProps {
  message?: string
  showCompareLink?: boolean
}

export function LocationInfo({
  message = 'Showing providers available in your area',
  showCompareLink = true
}: LocationInfoProps) {
  const { location, isLoading, detectFromGPS } = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-400">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm">Detecting your location...</span>
      </div>
    )
  }

  if (!location?.zipCode) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-gray-400 text-sm">Enter your location to see personalized results</p>
        <div className="flex gap-3">
          <button
            onClick={detectFromGPS}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Use My Location
          </button>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm font-medium hover:border-gray-500 transition-colors"
          >
            Enter ZIP Code
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 text-gray-300">
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm">
          {message}
          {location.city && ` in ${location.city}`}
          {location.regionCode && `, ${location.regionCode}`}
          {' '}
          <span className="font-medium text-white">{location.zipCode}</span>
        </span>
        {location.source === 'ip' && (
          <span className="text-xs text-gray-500">(approximate)</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        {showCompareLink && (
          <Link
            href={`/compare?zip=${location.zipCode}`}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            View all providers in {location.zipCode}
          </Link>
        )}
        <button
          onClick={() => {
            // Scroll to top where location banner is
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Change location
        </button>
      </div>
    </div>
  )
}
