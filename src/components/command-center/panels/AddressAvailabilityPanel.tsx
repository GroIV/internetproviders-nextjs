'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, H3Provider } from '@/contexts/LocationContext'
import { TechBadge, getTechType } from '@/components/ui/TechBadge'
import { PanelWrapper } from './PanelWrapper'

interface AddressAvailabilityPanelProps {
  data?: {
    address?: string | null
  }
}

export function AddressAvailabilityPanel({ data }: AddressAvailabilityPanelProps) {
  const { h3Availability, isLoadingH3, setAddressLocation, location } = useLocation()
  const [address, setAddress] = useState(data?.address || '')
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // If we already have H3 availability from GPS, show it
  const showExistingData = h3Availability && !hasSearched && location?.source === 'gps'

  // Auto-search if address was passed in
  useEffect(() => {
    if (data?.address && data.address.length > 5) {
      handleSearch(data.address)
    }
  }, [data?.address])

  const handleSearch = async (searchAddress?: string) => {
    const addr = searchAddress || address
    setError('')

    if (!addr || addr.length < 5) {
      setError('Please enter a complete address')
      return
    }

    setHasSearched(true)
    const success = await setAddressLocation(addr)
    if (!success) {
      setError('Could not find that address. Try including city and state.')
    }
  }

  const formatSpeed = (speed: number) => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(speed % 1000 === 0 ? 0 : 1)} Gbps`
    }
    return `${speed} Mbps`
  }

  return (
    <PanelWrapper
      title="Check Address Availability"
      accentColor="purple"
    >
      {/* Subtitle */}
      <p className="text-sm text-gray-400 mb-4 -mt-2">
        See exactly which providers serve your location
      </p>

      {/* Search Form */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter street address (e.g., 123 Main St, Austin, TX)"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              disabled={isLoadingH3}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={isLoadingH3}
            className="px-4 py-3 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoadingH3 ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            Check
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {isLoadingH3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Checking availability...</p>
          </motion.div>
        )}

        {!isLoadingH3 && (showExistingData || hasSearched) && h3Availability && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Matched Address */}
            {h3Availability.address && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-green-400">{h3Availability.address.matched}</span>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-gray-800/50 text-center">
                <p className="text-2xl font-bold text-white">{h3Availability.summary.totalProviders}</p>
                <p className="text-xs text-gray-400">Providers</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800/50 text-center">
                <p className="text-2xl font-bold text-cyan-400">{formatSpeed(h3Availability.summary.maxDownloadSpeed)}</p>
                <p className="text-xs text-gray-400">Max Speed</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800/50 text-center">
                <div className="flex flex-wrap justify-center gap-1">
                  {h3Availability.summary.hasFiber && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">Fiber</span>}
                  {h3Availability.summary.hasCable && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Cable</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1">Tech</p>
              </div>
            </div>

            {/* Provider List */}
            {h3Availability.providers.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p>No provider data found for this location</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {h3Availability.providers.slice(0, 10).map((provider: H3Provider, idx: number) => (
                  <motion.div
                    key={`${provider.providerId}-${provider.technologyCode}-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{provider.brandName}</span>
                        <TechBadge type={getTechType(provider.technology)} className="text-[10px] px-1.5 py-0.5" />
                      </div>
                      <div className="text-right">
                        <span className="text-cyan-400 font-semibold">{formatSpeed(provider.maxDownload)}</span>
                        <span className="text-gray-500 text-xs ml-1">/ {formatSpeed(provider.maxUpload)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {h3Availability.providers.length > 10 && (
                  <p className="text-center text-xs text-gray-500 py-2">
                    +{h3Availability.providers.length - 10} more providers
                  </p>
                )}
              </div>
            )}

            {/* Data Source */}
            <p className="mt-4 text-[10px] text-gray-600 text-center">
              Data: FCC Broadband Data Collection (June 2025)
            </p>
          </motion.div>
        )}

        {/* Initial state - GPS detected */}
        {!isLoadingH3 && !hasSearched && !showExistingData && location?.source === 'gps' && location.latitude && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-3">We detected your GPS location</p>
            <button
              onClick={() => {
                if (location.latitude && location.longitude) {
                  setHasSearched(true)
                  // Trigger fetch with current coordinates
                  fetch(`/api/availability?lat=${location.latitude}&lng=${location.longitude}`)
                    .then(r => r.json())
                    .then(data => {
                      if (data.success) {
                        // This will update via LocationContext
                      }
                    })
                }
              }}
              className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm hover:bg-cyan-700 transition-colors"
            >
              Check Providers at My Location
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoadingH3 && !hasSearched && !showExistingData && (!location || location.source !== 'gps') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400"
          >
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">Enter your address above to see available providers</p>
            <p className="text-xs text-gray-500 mt-2">Uses official FCC data for accurate results</p>
          </motion.div>
        )}
      </AnimatePresence>
    </PanelWrapper>
  )
}
