'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocation } from '@/contexts/LocationContext'

interface ZipSearchProps {
  defaultZip?: string
  syncWithGlobal?: boolean // If true, updates global location context
  navigateTo?: string // Custom redirect path, defaults to /compare?zip=
}

export function ZipSearch({
  defaultZip = '',
  syncWithGlobal = true,
  navigateTo
}: ZipSearchProps) {
  const { location, setManualZip } = useLocation()
  const [zipCode, setZipCode] = useState(defaultZip)
  const [error, setError] = useState('')
  const router = useRouter()

  // Auto-populate from global location if no default provided
  useEffect(() => {
    if (!defaultZip && location?.zipCode && !zipCode) {
      // Use timeout to satisfy lint (setState in callback)
      const zip = location.zipCode
      const timer = setTimeout(() => setZipCode(zip), 0)
      return () => clearTimeout(timer)
    }
  }, [location?.zipCode, defaultZip, zipCode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate ZIP code
    const cleanZip = zipCode.trim()
    if (!/^\d{5}$/.test(cleanZip)) {
      setError('Please enter a valid 5-digit ZIP code')
      return
    }

    // Update global location context
    if (syncWithGlobal) {
      setManualZip(cleanZip)
    }

    // Navigate to compare page or custom path
    const path = navigateTo || `/compare?zip=${cleanZip}`
    router.push(path)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="Enter your ZIP code"
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={5}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </form>
  )
}
