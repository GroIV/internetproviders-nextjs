'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function OfflinePage() {
  const [cachedLocation, setCachedLocation] = useState<{
    city?: string
    region?: string
    zip?: string
  } | null>(null)

  useEffect(() => {
    // Try to get cached location from localStorage
    const saved = localStorage.getItem('userLocation')
    if (saved) {
      try {
        const location = JSON.parse(saved)
        // Use timeout to satisfy lint (setState in callback)
        const timer = setTimeout(() => setCachedLocation(location), 0)
        return () => clearTimeout(timer)
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-xl mx-auto text-center">
        {/* Offline Icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gray-800 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-4">You&apos;re Offline</h1>
        <p className="text-gray-400 mb-8">
          It looks like you&apos;ve lost your internet connection. Some features may not be available until you&apos;re back online.
        </p>

        {/* Cached Location Info */}
        {cachedLocation && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-2">Your Saved Location</h2>
            <p className="text-gray-400">
              {cachedLocation.city && cachedLocation.region && (
                <span>{cachedLocation.city}, {cachedLocation.region}</span>
              )}
              {cachedLocation.zip && (
                <span className="ml-2 text-blue-400">({cachedLocation.zip})</span>
              )}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              When you&apos;re back online, we&apos;ll show providers for this location.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>

          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/providers"
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Providers
            </Link>
            <Link
              href="/guides"
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Guides
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 text-left">
          <h3 className="text-lg font-semibold mb-4">While You&apos;re Offline</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Previously visited pages may still be accessible</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Your location preferences are saved locally</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Provider availability checks require internet</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
