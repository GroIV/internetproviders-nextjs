'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { PanelWrapper } from './PanelWrapper'
import { useCommandCenter } from '@/contexts/CommandCenterContext'

interface CoverageData {
  fiber: number
  cable: number
  dsl: number
  wireless5g: number
  satellite: number
  any100: number
}

function CountUp({ end, suffix = '%' }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView && end > 0) {
      const duration = 1500
      const steps = 40
      const stepValue = end / steps
      let current = 0
      const timer = setInterval(() => {
        current += stepValue
        if (current >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [isInView, end])

  return <div ref={ref}>{count}{suffix}</div>
}

export function CoverageStatsPanel({ data }: { data?: { zipCode?: string } }) {
  const { context, goBack } = useCommandCenter()
  const zipCode = data?.zipCode || context.zipCode
  const [coverage, setCoverage] = useState<CoverageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cityName, setCityName] = useState<string>('')

  useEffect(() => {
    if (!zipCode) return

    const fetchCoverage = async () => {
      setIsLoading(true)
      try {
        // Fetch coverage stats from API
        const res = await fetch(`/api/providers/by-zip?zip=${zipCode}`)
        const apiResponse = await res.json()

        if (apiResponse.success && apiResponse.data?.coverage) {
          const coverage = apiResponse.data.coverage
          setCoverage({
            fiber: coverage.fiber?.speed100_20 || 0,
            cable: coverage.cable?.speed100_20 || 0,
            dsl: 0, // DSL not in current API response
            wireless5g: coverage.fixedWireless?.speed25_3 || 0,
            satellite: 100, // Satellite is always available
            any100: coverage.anyTechnology?.speed100_20 || 0,
          })
          setCityName(apiResponse.data.city || '')
        }
      } catch (error) {
        console.error('Failed to fetch coverage:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoverage()
  }, [zipCode])

  const stats = [
    { label: 'Fiber', value: coverage?.fiber || 0, color: 'from-green-400 to-emerald-500', bgColor: 'bg-green-500/20' },
    { label: 'Cable', value: coverage?.cable || 0, color: 'from-blue-400 to-cyan-500', bgColor: 'bg-blue-500/20' },
    { label: '5G/Fixed Wireless', value: coverage?.wireless5g || 0, color: 'from-purple-400 to-pink-500', bgColor: 'bg-purple-500/20' },
    { label: 'DSL', value: coverage?.dsl || 0, color: 'from-yellow-400 to-amber-500', bgColor: 'bg-yellow-500/20' },
  ]

  return (
    <PanelWrapper
      title={`Coverage in ${cityName || zipCode || 'Your Area'}`}
      accentColor="green"
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
      onClose={goBack}
    >
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-gray-700 rounded w-20 mb-2" />
              <div className="h-6 bg-gray-800 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Main stat - 100+ Mbps availability */}
          <motion.div
            className="text-center py-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-4xl font-bold text-cyan-400">
              <CountUp end={coverage?.any100 || 0} />
            </div>
            <div className="text-sm text-gray-400 mt-1">have 100+ Mbps available</div>
          </motion.div>

          {/* Technology breakdown */}
          <div className="space-y-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide">By Technology</div>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{stat.label}</span>
                  <span className="text-sm font-medium text-white">{stat.value}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Satellite note */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-800">
            Satellite internet (Starlink, Viasat) available everywhere
          </div>
        </div>
      )}
    </PanelWrapper>
  )
}
