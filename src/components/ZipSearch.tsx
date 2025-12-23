'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ZipSearch() {
  const [zipCode, setZipCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate ZIP code
    const cleanZip = zipCode.trim()
    if (!/^\d{5}$/.test(cleanZip)) {
      setError('Please enter a valid 5-digit ZIP code')
      return
    }

    router.push(`/compare?zip=${cleanZip}`)
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
