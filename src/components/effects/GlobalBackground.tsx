'use client'

import { useEffect, useState } from 'react'
import { ParticleBackground } from './ParticleBackground'
import { CircuitPattern } from './CircuitPattern'
import { AuroraBlobs } from './AuroraBlobs'

interface GlobalBackgroundProps {
  className?: string
}

export function GlobalBackground({ className = '' }: GlobalBackgroundProps) {
  // Initialize with window values if available
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    return false
  })
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  })

  useEffect(() => {
    // Check for mobile viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const motionHandler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    mediaQuery.addEventListener('change', motionHandler)

    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
      mediaQuery.removeEventListener('change', motionHandler)
    }
  }, [])

  // If user prefers reduced motion, show a minimal static background
  if (isReducedMotion) {
    return (
      <div
        className={`fixed inset-0 z-0 pointer-events-none ${className}`}
        aria-hidden="true"
      >
        {/* Just a subtle gradient for reduced motion users */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10" />
      </div>
    )
  }

  // Reduce particles on mobile for performance
  const particleCount = isMobile ? 20 : 30

  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Base dark background */}
      <div className="absolute inset-0 bg-gray-950" />

      {/* Aurora blobs - subtle gradient movement */}
      <AuroraBlobs opacity={0.12} />

      {/* Circuit pattern - very subtle */}
      <CircuitPattern opacity={0.03} animated={!isMobile} />

      {/* Particles with color shifting */}
      <ParticleBackground
        particleCount={particleCount}
        connectionDistance={isMobile ? 100 : 120}
        colorMode="shift"
        colorCycleDuration={30000}
      />
    </div>
  )
}
