'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ChatWindow } from '@/components/ChatWindow'
import { useLocation } from '@/contexts/LocationContext'
import Link from 'next/link'
import { sortByTechPriority } from '@/lib/techPriority'
import { ProviderLogo } from '@/components/ProviderLogo'

interface Provider {
  id: number
  name: string
  slug: string
  technologies: string[]
  category: string
  coveragePercent: number
}

// Provider details for enhanced cards (speedMbps used for speed bar calculation)
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
}

// Calculate speed percentage (logarithmic scale for better visualization)
// 100 Mbps = ~25%, 1 Gbps = ~60%, 5 Gbps = ~85%, 8 Gbps = 100%
const getSpeedPercent = (speedMbps: number): number => {
  const maxSpeed = 8000 // 8 Gbps as reference
  // Use logarithmic scale so slower speeds still show meaningful bars
  const logPercent = (Math.log10(speedMbps + 1) / Math.log10(maxSpeed + 1)) * 100
  return Math.min(Math.max(logPercent, 5), 100) // Min 5%, max 100%
}

// Technology colors for badges
const techColors: Record<string, string> = {
  'Fiber': 'from-green-400 to-emerald-500 shadow-green-500/30',
  'Cable': 'from-blue-400 to-cyan-500 shadow-blue-500/30',
  '5G': 'from-purple-400 to-pink-500 shadow-purple-500/30',
  'DSL': 'from-yellow-400 to-amber-500 shadow-yellow-500/30',
  'Satellite': 'from-slate-400 to-gray-500 shadow-slate-500/30',
  'Fixed Wireless': 'from-orange-400 to-red-500 shadow-orange-500/30',
}

// Animated counter component
function CountUp({ end, suffix = '' }: { end: number | string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView && typeof end === 'number') {
      const duration = 2000
      const steps = 60
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

  return (
    <div ref={ref} className="count-up">
      {typeof end === 'number' ? `${count.toLocaleString()}${suffix}` : end}
    </div>
  )
}

export default function Home() {
  const { location } = useLocation()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loadingProviders, setLoadingProviders] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  // Parallax effect for hero section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const orbsY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  // Fetch providers when location is available
  useEffect(() => {
    if (!location?.zipCode) return

    // Use async function to avoid setState in effect body
    const fetchProviders = async () => {
      setLoadingProviders(true)
      try {
        const res = await fetch(`/api/providers/list?zip=${location.zipCode}&limit=6`)
        const data = await res.json()
        if (data.success) {
          // Sort by technology priority (Fiber > Cable > 5G > Fixed Wireless > DSL > Satellite)
          const sorted = sortByTechPriority(data.providers, (p: Provider) => p.technologies || [])
          setProviders(sorted)
        }
      } catch (err) {
        console.error('Failed to fetch providers:', err)
      } finally {
        setLoadingProviders(false)
      }
    }

    fetchProviders()
  }, [location?.zipCode])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Chat */}
      <section ref={heroRef} className="relative py-8 md:py-12 flex-1 overflow-hidden">
        {/* Parallax gradient overlay (particles/circuit now global) */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/20"
          style={{ y: backgroundY }}
        />

        {/* Parallax Glowing orbs */}
        <motion.div
          className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
          style={{ y: orbsY }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
          style={{ y: orbsY }}
        />

        <motion.div
          className="container mx-auto px-4 relative z-10"
          style={{ opacity: contentOpacity }}
        >
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="holographic">Find Your Perfect</span>
                <br />
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  Internet Provider
                </span>
              </h1>
              <p className="text-gray-400">
                AI-powered recommendations based on your location and needs
              </p>
            </motion.div>

            {/* Main Chat Window */}
            <ChatWindow embedded={true} showQuickActions={true} />

            {/* Quick Links */}
            <motion.div
              className="mt-6 flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/tools/speed-test"
                className="group inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg text-sm border border-gray-700 transition-all hover:border-cyan-500/50 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <svg className="w-4 h-4 text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Speed Test
              </Link>
              <Link
                href="/guides"
                className="group inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg text-sm border border-gray-700 transition-all hover:border-blue-500/50 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <svg className="w-4 h-4 text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Guides
              </Link>
              <Link
                href="/providers"
                className="group inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg text-sm border border-gray-700 transition-all hover:border-purple-500/50 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <svg className="w-4 h-4 text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                All Providers
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Top Providers Section - Enhanced Spotlight Cards */}
      {(providers.length > 0 || loadingProviders) && (
        <section className="py-12 border-t border-gray-800 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 data-grid opacity-20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  <span className="holographic">Top Providers</span>
                  {' '}
                  <span className="text-white">
                    {location?.city ? `in ${location.city}` : 'in Your Area'}
                  </span>
                </h2>
                <p className="text-gray-400 text-sm">Based on coverage and technology in your area</p>
              </motion.div>

              {/* Provider Cards */}
              {loadingProviders ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 animate-pulse border border-gray-700/50">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gray-700 rounded-xl" />
                        <div className="flex-1">
                          <div className="h-5 bg-gray-700 rounded w-1/2 mb-2" />
                          <div className="h-4 bg-gray-700 rounded w-3/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {providers.slice(0, 4).map((provider, index) => {
                    const details = providerDetails[provider.slug] || {
                      maxSpeed: 'Varies',
                      speedMbps: 500,
                      startingPrice: 'Call',
                      color: 'from-gray-500 to-gray-600'
                    }
                    const speedPercent = getSpeedPercent(details.speedMbps)
                    return (
                      <motion.div
                        key={provider.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <Link
                          href={`/providers/${provider.slug}`}
                          className="group block relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
                        >
                          {/* Gradient overlay on hover */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${details.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />

                          <div className="flex items-start gap-4 relative">
                            {/* Provider Logo */}
                            <div className="relative flex-shrink-0">
                              <ProviderLogo slug={provider.slug} name={provider.name} size="lg" />
                              {/* Glow effect */}
                              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${details.color} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`} />
                            </div>

                            {/* Provider Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-lg text-white group-hover:text-cyan-400 transition-colors truncate">
                                  {provider.name}
                                </h3>
                                {/* Coverage badge */}
                                <span className="flex-shrink-0 px-2 py-0.5 bg-gray-800/80 text-gray-400 text-xs rounded-full border border-gray-700/50">
                                  {provider.coveragePercent}%
                                </span>
                              </div>

                              {/* Tech badges */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {provider.technologies.slice(0, 2).map((tech) => (
                                  <span
                                    key={tech}
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${techColors[tech] || 'from-gray-500 to-gray-600'} text-white shadow-sm`}
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="mt-5 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              {/* Speed */}
                              <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Max Speed</div>
                                <div className="text-lg font-bold text-cyan-400 neon-text-subtle">
                                  {details.maxSpeed}
                                </div>
                              </div>
                              {/* Price */}
                              <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">From</div>
                                <div className="text-lg font-bold text-green-400 neon-text-subtle">
                                  {details.startingPrice}<span className="text-sm font-normal text-gray-500">/mo</span>
                                </div>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="text-gray-600 group-hover:text-cyan-400 transition-colors">
                              <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>

                          {/* Speed bar */}
                          <div className="mt-4">
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${speedPercent}%` }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                              />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* View All Link */}
              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <Link
                  href="/providers"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl text-sm border border-gray-700 transition-all hover:border-cyan-500/50 hover:bg-gray-800/80 hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 group"
                >
                  <span>View all {providers.length}+ providers</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Compact Stats Section */}
      <section className="py-10 border-t border-gray-800 bg-gray-950/50 relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 circuit-pattern opacity-50" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-20 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-20 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center max-w-2xl mx-auto">
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <div className="text-3xl font-bold text-blue-400 neon-text-subtle">
                <CountUp end={90000} suffix="+" />
              </div>
              <div className="text-xs text-gray-500 mt-1">ZIP Codes</div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-3xl font-bold text-cyan-400 neon-text-subtle">
                <CountUp end={50} suffix="+" />
              </div>
              <div className="text-xs text-gray-500 mt-1">Providers</div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-purple-400 neon-text-subtle">AI</div>
              <div className="text-xs text-gray-500 mt-1">Powered</div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
