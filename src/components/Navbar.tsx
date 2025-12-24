'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { OfflineIndicator } from './OfflineIndicator'

// Animated Logo Component
function AnimatedLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      {/* Signal Icon with Animation */}
      <motion.div
        className="relative w-8 h-8"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
      >
        {/* Glow effect behind icon */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg blur-md opacity-50 group-hover:opacity-80 transition-opacity" />

        {/* Icon container */}
        <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
          {/* Signal bars */}
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <motion.rect
              x="2" y="16" width="4" height="6" rx="1"
              initial={{ scaleY: 0.5 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: 0 }}
              style={{ originY: 1 }}
            />
            <motion.rect
              x="8" y="12" width="4" height="10" rx="1"
              initial={{ scaleY: 0.5 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ originY: 1 }}
            />
            <motion.rect
              x="14" y="6" width="4" height="16" rx="1"
              initial={{ scaleY: 0.5 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ originY: 1 }}
            />
            <motion.rect
              x="20" y="2" width="4" height="20" rx="1"
              initial={{ scaleY: 0.5 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ originY: 1 }}
            />
          </svg>
        </div>

        {/* Animated pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-cyan-400"
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [1, 1.3, 1.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </motion.div>

      {/* Text Logo */}
      <div className="flex flex-col">
        <motion.span
          className="text-lg font-bold leading-tight"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
        >
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
            InternetProviders
          </span>
          <span className="text-cyan-400">.ai</span>
        </motion.span>
        <span className="text-[10px] text-gray-500 tracking-wider uppercase">
          Find Your Best Connection
        </span>
      </div>
    </Link>
  )
}

export function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <AnimatedLogo />

        <nav className="hidden md:flex items-center space-x-1">
          {/* Compare Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('compare')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              Compare
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'compare' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2">
                <Link href="/compare" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  Compare by ZIP Code
                </Link>
                <div className="border-t border-gray-800 my-2" />
                <div className="px-4 py-1 text-xs text-gray-500 uppercase tracking-wider">Providers</div>
                <Link href="/compare/att-internet-vs-spectrum" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  AT&T vs Spectrum
                </Link>
                <Link href="/compare/xfinity-vs-spectrum" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  Xfinity vs Spectrum
                </Link>
                <Link href="/compare/att-internet-vs-verizon-fios" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  AT&T vs Verizon
                </Link>
                <div className="border-t border-gray-800 my-2" />
                <div className="px-4 py-1 text-xs text-gray-500 uppercase tracking-wider">Technologies</div>
                <Link href="/compare/technology/fiber-vs-cable" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  Fiber vs Cable
                </Link>
                <Link href="/compare/technology/cable-vs-5g" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  Cable vs 5G
                </Link>
              </div>
            )}
          </div>

          {/* Rankings Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('rankings')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              Rankings
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'rankings' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2">
                <Link href="/best/fiber-providers" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  Best Fiber Providers
                </Link>
                <Link href="/best/cable-providers" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  Best Cable Providers
                </Link>
                <Link href="/fastest/providers" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  Fastest Providers
                </Link>
                <Link href="/cheapest/providers" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  Cheapest Providers
                </Link>
                <div className="border-t border-gray-800 my-2" />
                <Link href="/deals" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  Deals & Promotions
                </Link>
              </div>
            )}
          </div>

          {/* By State Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('states')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              By State
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'states' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2">
                <Link href="/internet" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  All States
                </Link>
                <div className="border-t border-gray-800 my-2" />
                <Link href="/internet/california" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  California
                </Link>
                <Link href="/internet/texas" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  Texas
                </Link>
                <Link href="/internet/florida" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  Florida
                </Link>
                <Link href="/internet/new-york" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800">
                  New York
                </Link>
              </div>
            )}
          </div>

          <Link href="/providers" className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            Providers
          </Link>

          <Link href="/guides" className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            Guides
          </Link>

          <Link href="/tools" className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            Tools
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <OfflineIndicator />
          <Link
            href="/compare"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Find Providers
          </Link>
        </div>
      </div>
    </header>
  )
}
