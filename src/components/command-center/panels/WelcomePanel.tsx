'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCommandCenter } from '@/contexts/CommandCenterContext'
import { useLocation } from '@/contexts/LocationContext'
import { PanelWrapper } from './PanelWrapper'

export function WelcomePanel() {
  const { setZipCode, showPanel } = useCommandCenter()
  const { location, detectFromGPS, isLoading } = useLocation()
  const [zipInput, setZipInput] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (zipInput.length === 5 && /^\d{5}$/.test(zipInput)) {
      setIsValidating(true)
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300))
      setZipCode(zipInput)
      setIsValidating(false)
    }
  }

  const handleDetectLocation = async () => {
    await detectFromGPS()
  }

  // If location is already known, auto-trigger (only once)
  useEffect(() => {
    if (location?.zipCode && !isLoading) {
      const timer = setTimeout(() => setZipCode(location.zipCode!), 500)
      return () => clearTimeout(timer)
    }
  }, [location?.zipCode, isLoading, setZipCode])

  return (
    <PanelWrapper
      title="Get Started"
      accentColor="cyan"
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      }
    >
      <div className="space-y-6">
        {/* Hero text */}
        <div className="text-center">
          <motion.h2
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Find Your Perfect
            </span>
            <br />
            <span className="text-white">Internet Provider</span>
          </motion.h2>
          <motion.p
            className="text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Enter your ZIP code or let us detect your location
          </motion.p>
        </div>

        {/* ZIP input form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <input
              type="text"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="Enter ZIP code"
              className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-center text-lg tracking-widest"
              maxLength={5}
            />
            {zipInput.length === 5 && (
              <motion.div
                className="absolute right-3 top-1/2 -translate-y-1/2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={zipInput.length !== 5 || isValidating}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            {isValidating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Finding providers...
              </span>
            ) : (
              'Find Providers'
            )}
          </button>
        </motion.form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-gray-900 text-gray-500">or</span>
          </div>
        </div>

        {/* Auto-detect button */}
        <motion.button
          onClick={handleDetectLocation}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gray-800/80 border border-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-800 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Detecting location...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Use My Location
            </>
          )}
        </motion.button>

        {/* Check Exact Address CTA */}
        <motion.button
          onClick={() => showPanel('addressAvailability')}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 font-medium rounded-xl hover:from-purple-600/30 hover:to-pink-600/30 hover:border-purple-500/50 transition-all flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Check Exact Address
          <span className="text-xs text-purple-400/70">(More precise)</span>
        </motion.button>

        {/* Quick actions */}
        <motion.div
          className="grid grid-cols-2 gap-2 pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => showPanel('speedTest')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 text-sm hover:text-white hover:border-gray-600 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Speed Test
          </button>
          <button
            onClick={() => showPanel('quiz')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 text-sm hover:text-white hover:border-gray-600 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Take Quiz
          </button>
        </motion.div>
      </div>
    </PanelWrapper>
  )
}
