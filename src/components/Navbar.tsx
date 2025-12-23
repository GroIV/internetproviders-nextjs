'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            InternetProviders.ai
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/compare" className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            Compare
          </Link>

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
