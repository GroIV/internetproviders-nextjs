'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TechBadge, getTechType } from './ui/TechBadge'

interface Provider {
  providerId: string
  brandName: string
  technology: string
  technologyCode: number
  technologyDetail: string
  maxDownload: number
  maxUpload: number
  lowLatency: boolean
  locationCount: number
}

interface AvailabilityData {
  h3Index: string
  coordinates: { lat: number; lng: number } | null
  address: {
    input: string
    matched: string
    components: {
      streetAddress: string
      city: string
      state: string
      zip: string
    }
  } | null
  providers: Provider[]
  byTechnology: Record<string, Provider[]>
  summary: {
    totalProviders: number
    totalOptions: number
    hasFiber: boolean
    hasCable: boolean
    hasDSL: boolean
    hasFixedWireless: boolean
    hasSatellite: boolean
    maxDownloadSpeed: number
    maxUploadSpeed: number
    state: string | null
  }
}

interface AddressAvailabilityProps {
  className?: string
  showTitle?: boolean
  compact?: boolean
}

export function AddressAvailability({
  className = '',
  showTitle = true,
  compact = false
}: AddressAvailabilityProps) {
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<AvailabilityData | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setData(null)

    const cleanAddress = address.trim()
    if (!cleanAddress) {
      setError('Please enter an address')
      return
    }

    if (cleanAddress.length < 5) {
      setError('Please enter a more complete address')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/availability?address=${encodeURIComponent(cleanAddress)}`)
      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Could not find providers for this address')
        return
      }

      setData(result.data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatSpeed = (speed: number) => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(speed % 1000 === 0 ? 0 : 1)} Gbps`
    }
    return `${speed} Mbps`
  }

  return (
    <div className={`w-full ${className}`}>
      {showTitle && (
        <h2 className="text-2xl font-bold text-white mb-4">
          Check Internet Availability
        </h2>
      )}

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your street address (e.g., 123 Main St, Austin, TX)"
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Check
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 text-sm text-red-400 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </form>

      {/* Results */}
      <AnimatePresence mode="wait">
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Matched Address */}
            {data.address && (
              <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Showing results for:</p>
                    <p className="text-white font-medium">{data.address.matched}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
                <p className="text-3xl font-bold text-white">{data.summary.totalProviders}</p>
                <p className="text-sm text-gray-400">Providers</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
                <p className="text-3xl font-bold text-blue-400">{formatSpeed(data.summary.maxDownloadSpeed)}</p>
                <p className="text-sm text-gray-400">Max Download</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
                <p className="text-3xl font-bold text-green-400">{formatSpeed(data.summary.maxUploadSpeed)}</p>
                <p className="text-sm text-gray-400">Max Upload</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
                <div className="flex flex-wrap justify-center gap-1">
                  {data.summary.hasFiber && <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">Fiber</span>}
                  {data.summary.hasCable && <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">Cable</span>}
                  {data.summary.hasFixedWireless && <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">Wireless</span>}
                  {data.summary.hasSatellite && <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400">Satellite</span>}
                </div>
                <p className="text-sm text-gray-400 mt-1">Available Tech</p>
              </div>
            </div>

            {/* Provider List */}
            {data.providers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No provider data found for this location</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Available Providers ({data.providers.length} options)
                </h3>

                {compact ? (
                  // Compact view - grouped by technology
                  <div className="space-y-4">
                    {Object.entries(data.byTechnology).map(([tech, providers]) => (
                      <div key={tech}>
                        <div className="flex items-center gap-2 mb-2">
                          <TechBadge type={getTechType(tech)} />
                          <span className="text-sm text-gray-400">({providers.length})</span>
                        </div>
                        <div className="grid gap-2">
                          {providers.slice(0, 3).map((provider, idx) => (
                            <div
                              key={`${provider.providerId}-${provider.technologyCode}-${idx}`}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/50"
                            >
                              <span className="text-white font-medium">{provider.brandName}</span>
                              <span className="text-blue-400">{formatSpeed(provider.maxDownload)}</span>
                            </div>
                          ))}
                          {providers.length > 3 && (
                            <p className="text-sm text-gray-500 text-center">+{providers.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Full view - all providers
                  <div className="space-y-3">
                    {data.providers.map((provider, idx) => (
                      <motion.div
                        key={`${provider.providerId}-${provider.technologyCode}-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-300">
                              {provider.brandName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{provider.brandName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <TechBadge type={getTechType(provider.technology)} className="text-xs" />
                                {provider.lowLatency && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                                    Low Latency
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 sm:text-right">
                            <div>
                              <p className="text-2xl font-bold text-blue-400">{formatSpeed(provider.maxDownload)}</p>
                              <p className="text-xs text-gray-500">Download</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-green-400">{formatSpeed(provider.maxUpload)}</p>
                              <p className="text-xs text-gray-500">Upload</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Data Source */}
            <p className="mt-6 text-xs text-gray-500 text-center">
              Data source: FCC Broadband Data Collection (June 2025)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
