'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useLocation } from '@/contexts/LocationContext'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollReveal, StaggerContainer, AnimatedToggle, LoadingSpinner } from '@/components/ui'
import { sortByTechPriority } from '@/lib/techPriority'
import { ProviderLogo } from '@/components/ProviderLogo'

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

// Provider details for enhanced cards
const providerDetails: Record<string, { maxSpeed: string; speedMbps: number; startingPrice: string; color: string }> = {
  'xfinity': { maxSpeed: '2 Gbps', speedMbps: 2000, startingPrice: '$30', color: 'from-purple-500 to-blue-500' },
  'spectrum': { maxSpeed: '1 Gbps', speedMbps: 1000, startingPrice: '$50', color: 'from-blue-500 to-cyan-500' },
  'att-internet': { maxSpeed: '5 Gbps', speedMbps: 5000, startingPrice: '$55', color: 'from-cyan-500 to-blue-500' },
  'verizon-fios': { maxSpeed: '2.3 Gbps', speedMbps: 2300, startingPrice: '$50', color: 'from-red-500 to-orange-500' },
  'verizon-5g': { maxSpeed: '1 Gbps', speedMbps: 1000, startingPrice: '$35', color: 'from-red-500 to-pink-500' },
  'cox': { maxSpeed: '2 Gbps', speedMbps: 2000, startingPrice: '$50', color: 'from-orange-500 to-amber-500' },
  'frontier': { maxSpeed: '5 Gbps', speedMbps: 5000, startingPrice: '$50', color: 'from-red-600 to-red-400' },
  'google-fiber': { maxSpeed: '8 Gbps', speedMbps: 8000, startingPrice: '$70', color: 'from-green-500 to-blue-500' },
  't-mobile': { maxSpeed: '245 Mbps', speedMbps: 245, startingPrice: '$40', color: 'from-pink-500 to-purple-500' },
  'centurylink': { maxSpeed: '940 Mbps', speedMbps: 940, startingPrice: '$30', color: 'from-green-500 to-teal-500' },
  'earthlink': { maxSpeed: '5 Gbps', speedMbps: 5000, startingPrice: '$50', color: 'from-blue-600 to-indigo-500' },
  'hughesnet': { maxSpeed: '100 Mbps', speedMbps: 100, startingPrice: '$50', color: 'from-blue-700 to-blue-500' },
  'viasat': { maxSpeed: '150 Mbps', speedMbps: 150, startingPrice: '$70', color: 'from-indigo-500 to-blue-500' },
  'starlink': { maxSpeed: '220 Mbps', speedMbps: 220, startingPrice: '$120', color: 'from-slate-600 to-slate-400' },
  'optimum': { maxSpeed: '8 Gbps', speedMbps: 8000, startingPrice: '$40', color: 'from-yellow-500 to-amber-500' },
  'windstream': { maxSpeed: '2 Gbps', speedMbps: 2000, startingPrice: '$40', color: 'from-emerald-500 to-green-500' },
  'mediacom': { maxSpeed: '1 Gbps', speedMbps: 1000, startingPrice: '$30', color: 'from-blue-500 to-blue-400' },
  'wow': { maxSpeed: '1 Gbps', speedMbps: 1000, startingPrice: '$40', color: 'from-orange-500 to-yellow-500' },
  'astound': { maxSpeed: '1.5 Gbps', speedMbps: 1500, startingPrice: '$25', color: 'from-cyan-500 to-teal-500' },
  'brightspeed': { maxSpeed: '940 Mbps', speedMbps: 940, startingPrice: '$50', color: 'from-orange-400 to-red-500' },
  'ziply': { maxSpeed: '5 Gbps', speedMbps: 5000, startingPrice: '$20', color: 'from-green-400 to-emerald-500' },
  'metronet': { maxSpeed: '5 Gbps', speedMbps: 5000, startingPrice: '$50', color: 'from-blue-500 to-purple-500' },
  'directv': { maxSpeed: 'N/A', speedMbps: 0, startingPrice: '$65', color: 'from-blue-600 to-blue-400' },
  'dish': { maxSpeed: 'N/A', speedMbps: 0, startingPrice: '$80', color: 'from-red-600 to-red-400' },
}

// Calculate speed percentage (logarithmic scale for better visualization)
const getSpeedPercent = (speedMbps: number): number => {
  if (speedMbps === 0) return 0
  const maxSpeed = 8000
  const logPercent = (Math.log10(speedMbps + 1) / Math.log10(maxSpeed + 1)) * 100
  return Math.min(Math.max(logPercent, 5), 100)
}

// Technology colors for gradient badges
const techColors: Record<string, string> = {
  'Fiber': 'from-green-400 to-emerald-500',
  'Cable': 'from-blue-400 to-cyan-500',
  'DSL': 'from-yellow-400 to-amber-500',
  '5G': 'from-purple-400 to-pink-500',
  'Fixed Wireless': 'from-orange-400 to-red-500',
  'Satellite': 'from-slate-400 to-gray-500',
}

export function ProvidersPageClient({ allProviders }: ProvidersPageClientProps) {
  const { location, setManualZip } = useLocation()
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

  // Filter providers based on toggle and sort by technology priority
  const displayProviders = useMemo(() => {
    let providers: Provider[]
    if (!showOnlyAvailable || !location?.zipCode) {
      providers = allProviders
    } else if (availableProviders.length > 0) {
      // If we have available providers data, filter to only those
      providers = allProviders.filter(p => availableSlugs.has(p.slug))
    } else {
      providers = allProviders
    }
    // Sort by technology priority (Fiber > Cable > 5G > Fixed Wireless > DSL > Satellite)
    return sortByTechPriority(providers, (p) => p.technologies || [])
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
        <ScrollReveal direction="up" className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text-ocean">Internet Providers</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Compare the top internet service providers in the United States
          </p>
        </ScrollReveal>

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
              <AnimatedToggle
                checked={showOnlyAvailable && !!location?.zipCode}
                onChange={() => setShowOnlyAvailable(!showOnlyAvailable)}
                disabled={!location?.zipCode}
                activeColor="cyan"
              />
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
                  <LoadingSpinner variant="dots" size="sm" />
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
        <StaggerContainer
          staggerDelay={0.1}
          direction="up"
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12"
        >
          <div className="futuristic-card rounded-xl p-4 text-center glow-burst-hover">
            <div className="text-2xl font-bold text-blue-400">{displayProviders.length}</div>
            <div className="text-sm text-gray-400">
              {showOnlyAvailable && location?.zipCode ? 'Available' : 'Total'} Providers
            </div>
          </div>
          <div className="futuristic-card rounded-xl p-4 text-center glow-burst-emerald">
            <div className="text-2xl font-bold text-green-400">{fiberProviders.length}</div>
            <div className="text-sm text-gray-400">Fiber Providers</div>
          </div>
          <div className="futuristic-card rounded-xl p-4 text-center glow-burst-hover">
            <div className="text-2xl font-bold text-cyan-400">{cableProviders.length}</div>
            <div className="text-sm text-gray-400">Cable Providers</div>
          </div>
          <div className="futuristic-card rounded-xl p-4 text-center glow-burst-orange">
            <div className="text-2xl font-bold text-orange-400">{satelliteProviders.length}</div>
            <div className="text-sm text-gray-400">Satellite Providers</div>
          </div>
          <div className="futuristic-card rounded-xl p-4 text-center glow-burst-pink">
            <div className="text-2xl font-bold text-purple-400">{tvProviders.length}</div>
            <div className="text-sm text-gray-400">TV Providers</div>
          </div>
        </StaggerContainer>

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
        <ScrollReveal direction="left">
          <h2 className="text-2xl font-semibold mb-6 gradient-text-fresh">
            {showOnlyAvailable && location?.zipCode ? 'Available Providers' : 'All Providers'}
          </h2>
        </ScrollReveal>

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
  const details = providerDetails[provider.slug] || {
    maxSpeed: 'Varies',
    speedMbps: 500,
    startingPrice: 'Call',
    color: 'from-gray-500 to-gray-600'
  }
  const speedPercent = getSpeedPercent(details.speedMbps)
  const isTV = provider.category === 'TV' || provider.category === 'Satellite TV'

  return (
    <Link
      href={`/providers/${provider.slug}`}
      className="group block relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${details.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />

      <div className="flex items-start gap-4 relative">
        {/* Provider Logo */}
        <div className="relative flex-shrink-0">
          <ProviderLogo slug={provider.slug} name={provider.name} size="md" />
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${details.color} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`} />
        </div>

        {/* Provider Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
              {provider.name}
            </h3>
            {/* Coverage badge */}
            {coveragePercent !== undefined && (
              <span className="flex-shrink-0 px-2 py-0.5 bg-gray-800/80 text-gray-400 text-xs rounded-full border border-gray-700/50">
                {coveragePercent}%
              </span>
            )}
          </div>

          {/* Tech badges */}
          {provider.technologies && provider.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {provider.technologies.slice(0, 2).map((tech: string) => (
                <span
                  key={tech}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${techColors[tech] || 'from-gray-500 to-gray-600'} text-white shadow-sm`}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-4 pt-3 border-t border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Speed */}
          {!isTV && (
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Speed</div>
              <div className="text-sm font-bold text-cyan-400">
                {details.maxSpeed}
              </div>
            </div>
          )}
          {/* Price */}
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">From</div>
            <div className="text-sm font-bold text-green-400">
              {details.startingPrice}<span className="text-xs font-normal text-gray-500">/mo</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-gray-600 group-hover:text-cyan-400 transition-colors">
          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Speed bar (only for internet providers) */}
      {!isTV && speedPercent > 0 && (
        <div className="mt-3">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${speedPercent}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}
