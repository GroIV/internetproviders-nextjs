'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useLocation } from '@/contexts/LocationContext'
import { motion, AnimatePresence } from 'framer-motion'

interface Provider {
  id: number
  name: string
  slug: string
  technologies: string[] | null
  category: string
}

interface AvailableProvider {
  id: number
  name: string
  slug: string
  technologies: string[]
  category: string
  coveragePercent: number
}

interface ProvidersPageClientProps {
  allProviders: Provider[]
}

const technologyColors: Record<string, string> = {
  'Fiber': 'bg-green-600/20 text-green-400',
  'Cable': 'bg-blue-600/20 text-blue-400',
  'DSL': 'bg-yellow-600/20 text-yellow-400',
  '5G': 'bg-purple-600/20 text-purple-400',
  'Fixed Wireless': 'bg-cyan-600/20 text-cyan-400',
  'Satellite': 'bg-orange-600/20 text-orange-400',
}

export function ProvidersPageClient({ allProviders }: ProvidersPageClientProps) {
  const { location, isLoading: locationLoading, setManualZip } = useLocation()
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)
  const [availableProviders, setAvailableProviders] = useState<AvailableProvider[]>([])
  const [isLoadingProviders, setIsLoadingProviders] = useState(false)
  const [zipInput, setZipInput] = useState('')

  // Fetch available providers when location changes
  useEffect(() => {
    if (location?.zipCode && showOnlyAvailable) {
      fetchAvailableProviders(location.zipCode)
    }
  }, [location?.zipCode, showOnlyAvailable])

  const fetchAvailableProviders = async (zipCode: string) => {
    setIsLoadingProviders(true)
    try {
      const response = await fetch(`/api/providers/available?zip=${zipCode}`)
      const data = await response.json()
      if (data.success) {
        setAvailableProviders(data.data.providers)
      }
    } catch (error) {
      console.error('Failed to fetch available providers:', error)
    } finally {
      setIsLoadingProviders(false)
    }
  }

  // Get available provider slugs for filtering
  const availableSlugs = useMemo(() =>
    new Set(availableProviders.map(p => p.slug)),
    [availableProviders]
  )

  // Filter providers based on toggle
  const displayProviders = useMemo(() => {
    if (!showOnlyAvailable || !location?.zipCode) {
      return allProviders
    }
    // If we have available providers data, filter to only those
    if (availableProviders.length > 0) {
      return allProviders.filter(p => availableSlugs.has(p.slug))
    }
    return allProviders
  }, [allProviders, showOnlyAvailable, location?.zipCode, availableProviders, availableSlugs])

  // Group providers by type
  const fiberProviders = displayProviders.filter(p => p.technologies?.includes('Fiber'))
  const cableProviders = displayProviders.filter(p => p.technologies?.includes('Cable'))
  const satelliteProviders = displayProviders.filter(p => p.technologies?.includes('Satellite'))
  const tvProviders = displayProviders.filter(p => p.category === 'TV' || p.category === 'Satellite TV')

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (/^\d{5}$/.test(zipInput)) {
      setManualZip(zipInput)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Internet Providers</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Compare the top internet service providers in the United States
          </p>
        </div>

        {/* Location & Filter Controls */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* ZIP Code Input */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">Your location:</span>
              </div>

              {location?.zipCode ? (
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">
                    {location.city ? `${location.city}, ` : ''}{location.zipCode}
                  </span>
                  <button
                    onClick={() => setZipInput('')}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <form onSubmit={handleZipSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter ZIP"
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="w-24 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={!/^\d{5}$/.test(zipInput)}
                    className="px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Go
                  </button>
                </form>
              )}
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className={`text-sm ${!showOnlyAvailable ? 'text-white' : 'text-gray-500'}`}>
                All Providers
              </span>
              <button
                onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                disabled={!location?.zipCode}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  showOnlyAvailable && location?.zipCode
                    ? 'bg-cyan-600'
                    : 'bg-gray-700'
                } ${!location?.zipCode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    showOnlyAvailable && location?.zipCode ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${showOnlyAvailable && location?.zipCode ? 'text-white' : 'text-gray-500'}`}>
                Available in My Area
              </span>
            </div>
          </div>

          {/* Status Message */}
          {showOnlyAvailable && location?.zipCode && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              {isLoadingProviders ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  Loading available providers...
                </div>
              ) : availableProviders.length > 0 ? (
                <p className="text-sm text-gray-400">
                  Showing <span className="text-cyan-400 font-medium">{availableProviders.length}</span> providers available in{' '}
                  <span className="text-white">{location.city || location.zipCode}</span>
                </p>
              ) : (
                <p className="text-sm text-yellow-400">
                  No provider coverage data found for this ZIP. Showing all providers.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{displayProviders.length}</div>
            <div className="text-sm text-gray-400">
              {showOnlyAvailable && location?.zipCode ? 'Available' : 'Total'} Providers
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{fiberProviders.length}</div>
            <div className="text-sm text-gray-400">Fiber Providers</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{cableProviders.length}</div>
            <div className="text-sm text-gray-400">Cable Providers</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{satelliteProviders.length}</div>
            <div className="text-sm text-gray-400">Satellite Providers</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{tvProviders.length}</div>
            <div className="text-sm text-gray-400">TV Providers</div>
          </div>
        </div>

        {/* TV Providers Section */}
        {tvProviders.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              TV Providers
              <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-sm rounded">Satellite TV</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {tvProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </>
        )}

        {/* All Providers Grid */}
        <h2 className="text-2xl font-semibold mb-6">
          {showOnlyAvailable && location?.zipCode ? 'Available Providers' : 'All Providers'}
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={showOnlyAvailable ? 'available' : 'all'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {displayProviders.map((provider) => {
              // Find coverage info if available
              const coverageInfo = availableProviders.find(p => p.slug === provider.slug)
              return (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  coveragePercent={coverageInfo?.coveragePercent}
                />
              )
            })}
          </motion.div>
        </AnimatePresence>

        {displayProviders.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No providers found for your location.</p>
            <button
              onClick={() => setShowOnlyAvailable(false)}
              className="mt-4 text-cyan-400 hover:text-cyan-300"
            >
              View all providers
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-gray-400 mb-6">Our AI assistant can help you find the best provider for your needs</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Chat with AI Advisor
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProviderCard({
  provider,
  coveragePercent
}: {
  provider: Provider
  coveragePercent?: number
}) {
  return (
    <Link
      href={`/providers/${provider.slug}`}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-600/50 transition-colors group relative"
    >
      {/* Coverage badge */}
      {coveragePercent !== undefined && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-cyan-600/20 text-cyan-400 text-xs rounded-full">
            {coveragePercent}% coverage
          </span>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
          {provider.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
            {provider.name}
          </h3>
          <p className="text-sm text-gray-400">{provider.category}</p>
        </div>
      </div>

      {provider.technologies && provider.technologies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {provider.technologies.map((tech: string) => (
            <span
              key={tech}
              className={`px-2 py-1 rounded text-xs font-medium ${technologyColors[tech] || 'bg-gray-600/20 text-gray-400'}`}
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
