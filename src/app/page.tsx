'use client'

import { ChatWindow } from '@/components/ChatWindow'
import { useLocation } from '@/contexts/LocationContext'
import Link from 'next/link'

export default function Home() {
  const { location, isLoading: locationLoading } = useLocation()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Chat */}
      <section className="relative py-8 md:py-12 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-gray-950 to-cyan-900/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                Find Your Perfect Internet Provider
              </h1>
              <p className="text-gray-400">
                AI-powered recommendations based on your location and needs
              </p>
            </div>

            {/* Location Bar */}
            <div className="mb-4 flex items-center justify-center gap-2 text-sm">
              {locationLoading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Detecting location...
                </div>
              ) : location?.zipCode ? (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-300">
                    {location.city ? `${location.city}, ${location.regionCode}` : `ZIP ${location.zipCode}`}
                  </span>
                  {location.source === 'ip' && (
                    <span className="text-gray-500 text-xs">(approximate)</span>
                  )}
                  <Link
                    href="/compare"
                    className="text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    Change
                  </Link>
                </div>
              ) : (
                <span className="text-gray-400">Location not detected</span>
              )}
            </div>

            {/* Main Chat Window */}
            <ChatWindow embedded={true} showQuickActions={true} />

            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/tools/speed-test"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Speed Test
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Guides
              </Link>
              <Link
                href="/providers"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                All Providers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Stats Section */}
      <section className="py-8 border-t border-gray-800 bg-gray-950/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center max-w-2xl mx-auto">
            <div>
              <div className="text-2xl font-bold text-blue-400">90K+</div>
              <div className="text-xs text-gray-500">ZIP Codes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400">50+</div>
              <div className="text-xs text-gray-500">Providers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">AI</div>
              <div className="text-xs text-gray-500">Powered</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
