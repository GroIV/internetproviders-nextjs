'use client'

import { useState } from 'react'
import { useLocation } from '@/contexts/LocationContext'
import Link from 'next/link'

export function LocationBanner() {
  const { location, isLoading, error, detectFromGPS, setManualZip } = useLocation()
  const [showEdit, setShowEdit] = useState(false)
  const [zipInput, setZipInput] = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)

  const handleGPSClick = async () => {
    setGpsLoading(true)
    try {
      await detectFromGPS()
    } finally {
      setGpsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 border-b border-gray-800 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Detecting your location...
          </div>
        </div>
      </div>
    )
  }

  if (!location?.zipCode && !showEdit) {
    return (
      <div className="bg-blue-900/30 border-b border-blue-800/50 py-2 sm:py-2 py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-sm">
            <span className="text-gray-300 text-center">Enter your ZIP to see local providers</span>
            {error && (
              <span className="text-red-400 text-xs">{error}</span>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleGPSClick}
                disabled={gpsLoading}
                className="px-4 py-2 sm:px-3 sm:py-1 bg-blue-600 text-white rounded text-sm sm:text-xs font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {gpsLoading ? (
                  <>
                    <svg className="w-4 h-4 sm:w-3 sm:h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Getting location...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use My Location
                  </>
                )}
              </button>
              <button
                onClick={() => setShowEdit(true)}
                className="px-4 py-2 sm:px-3 sm:py-1 border border-gray-600 text-gray-300 rounded text-sm sm:text-xs font-medium hover:border-gray-500"
              >
                Enter ZIP
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showEdit) {
    return (
      <div className="bg-gray-900/50 border-b border-gray-800 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              maxLength={5}
              placeholder="Enter ZIP"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="w-24 px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-center focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={() => {
                if (zipInput.length === 5) {
                  setManualZip(zipInput)
                  setShowEdit(false)
                  setZipInput('')
                }
              }}
              disabled={zipInput.length !== 5}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Set
            </button>
            <button
              onClick={() => {
                setShowEdit(false)
                setZipInput('')
              }}
              className="px-3 py-1 text-gray-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!location) return null

  return (
    <div className="bg-gray-900/50 border-b border-gray-800 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {location.city && `${location.city}, `}
              {location.regionCode || location.region}
              {' '}
              <span className="font-medium">{location.zipCode}</span>
            </span>
            {location.source === 'ip' && (
              <span className="text-xs text-gray-500">(approximate)</span>
            )}
          </div>

          <Link
            href={`/compare?zip=${location.zipCode}`}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
          >
            View Providers
          </Link>

          <button
            onClick={() => setShowEdit(true)}
            className="text-xs text-gray-400 hover:text-white"
          >
            Change
          </button>

          {location.source === 'ip' && (
            <button
              onClick={handleGPSClick}
              disabled={gpsLoading}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
            >
              {gpsLoading ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Getting...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Use precise location
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
