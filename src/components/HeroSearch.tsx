'use client'

import { useLocation } from '@/contexts/LocationContext'
import { ZipSearch } from './ZipSearch'
import Link from 'next/link'

export function HeroSearch() {
  const { location, isLoading } = useLocation()

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="h-14 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Detecting your location...</div>
      </div>
    )
  }

  // If we have a ZIP, show personalized CTA
  if (location?.zipCode) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Link
          href={`/compare?zip=${location.zipCode}`}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          View Providers in {location.city || location.zipCode}
        </Link>
        <button
          onClick={() => {
            const el = document.getElementById('zip-search-fallback')
            if (el) el.classList.toggle('hidden')
          }}
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Or search a different ZIP code
        </button>
        <div id="zip-search-fallback" className="hidden mt-4 w-full max-w-md">
          <ZipSearch />
        </div>
      </div>
    )
  }

  // No location - show search
  return <ZipSearch />
}
