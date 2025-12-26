'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ChatWindow } from '@/components/ChatWindow'
import { useLocation } from '@/contexts/LocationContext'
import Link from 'next/link'

interface Provider {
  id: number
  name: string
  slug: string
  technologies: string[]
  category: string
  coveragePercent: number
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
  const { location, isLoading: locationLoading } = useLocation()
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
    if (location?.zipCode) {
      setLoadingProviders(true)
      fetch(`/api/providers/list?zip=${location.zipCode}&limit=6`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProviders(data.providers)
          }
        })
        .catch(err => console.error('Failed to fetch providers:', err))
        .finally(() => setLoadingProviders(false))
    }
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

      {/* Top Providers Section */}
      {(providers.length > 0 || loadingProviders) && (
        <section className="py-8 border-t border-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 data-grid opacity-30" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <motion.h2
                className="text-xl font-semibold text-white text-center mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <span className="neon-text-subtle text-cyan-400">Top Providers</span>
                {' '}
                {location?.city ? `in ${location.city}` : 'in Your Area'}
              </motion.h2>
              {loadingProviders ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse border border-gray-700">
                      <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-700 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {providers.map((provider, index) => (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={`/providers/${provider.slug}`}
                        className="block futuristic-card corner-accent rounded-lg p-4 group"
                      >
                        <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                          {provider.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-2 flex flex-wrap gap-1">
                          {provider.technologies.slice(0, 2).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 bg-gray-700/50 rounded border border-gray-600/50 text-gray-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
              <motion.div
                className="text-center mt-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <Link
                  href="/providers"
                  className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 group"
                >
                  View all providers
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
