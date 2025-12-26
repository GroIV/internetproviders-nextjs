'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocation } from '@/contexts/LocationContext'
import { ZipSearch } from './ZipSearch'

interface CompareAutoRedirectProps {
  hasZipParam: boolean
  showInstructions?: boolean
}

export function CompareAutoRedirect({ hasZipParam, showInstructions = false }: CompareAutoRedirectProps) {
  const router = useRouter()
  const { location, isLoading } = useLocation()
  const [hasRedirected, setHasRedirected] = useState(false)

  // Auto-redirect to compare page with ZIP when location is available
  useEffect(() => {
    if (!hasZipParam && !isLoading && location?.zipCode && !hasRedirected) {
      setHasRedirected(true)
      router.replace(`/compare?zip=${location.zipCode}`)
    }
  }, [hasZipParam, isLoading, location?.zipCode, hasRedirected, router])

  // If we have a ZIP param, don't render anything (results are shown by server component)
  if (hasZipParam) {
    return null
  }

  // Still loading location - show loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Detecting your location...</span>
        </div>
      </div>
    )
  }

  // No location detected - show manual ZIP search with optional instructions
  if (!location?.zipCode) {
    return (
      <>
        <ZipSearch />
        {showInstructions && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 futuristic-card rounded-xl corner-accent glow-burst-hover">
              <div className="text-3xl mb-3 gradient-text-fresh">1</div>
              <h3 className="font-semibold mb-2">Enter Your ZIP</h3>
              <p className="text-sm text-gray-400">Type your 5-digit ZIP code to start</p>
            </div>
            <div className="p-6 futuristic-card rounded-xl corner-accent glow-burst-hover">
              <div className="text-3xl mb-3 gradient-text-ocean">2</div>
              <h3 className="font-semibold mb-2">See Providers</h3>
              <p className="text-sm text-gray-400">View all available internet providers</p>
            </div>
            <div className="p-6 futuristic-card rounded-xl corner-accent glow-burst-hover">
              <div className="text-3xl mb-3 gradient-text-sunset">3</div>
              <h3 className="font-semibold mb-2">Compare Coverage</h3>
              <p className="text-sm text-gray-400">Check speeds and technology availability</p>
            </div>
          </div>
        )}
      </>
    )
  }

  // Location detected but redirect in progress
  return (
    <div className="text-center py-4">
      <div className="flex items-center justify-center gap-2 text-gray-400">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Loading providers for {location.city || location.zipCode}...</span>
      </div>
    </div>
  )
}
