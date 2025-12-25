'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AuroraBlobsProps {
  className?: string
  opacity?: number
}

// HSL colors for the aurora blobs
const BLOB_COLORS = [
  { h: 217, s: 91, l: 60 },  // Blue
  { h: 180, s: 100, l: 43 }, // Cyan
  { h: 262, s: 83, l: 58 },  // Purple
]

export function AuroraBlobs({ className = '', opacity = 0.12 }: AuroraBlobsProps) {
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  if (isReducedMotion) {
    return null
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Blob 1 - Blue, top-left area */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, hsla(${BLOB_COLORS[0].h}, ${BLOB_COLORS[0].s}%, ${BLOB_COLORS[0].l}%, ${opacity}) 0%, transparent 70%)`,
          left: '-10%',
          top: '-10%',
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Blob 2 - Cyan, center-right area */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, hsla(${BLOB_COLORS[1].h}, ${BLOB_COLORS[1].s}%, ${BLOB_COLORS[1].l}%, ${opacity}) 0%, transparent 70%)`,
          right: '-5%',
          top: '30%',
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, 80, -40, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5,
        }}
      />

      {/* Blob 3 - Purple, bottom-left area */}
      <motion.div
        className="absolute w-[550px] h-[550px] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, hsla(${BLOB_COLORS[2].h}, ${BLOB_COLORS[2].s}%, ${BLOB_COLORS[2].l}%, ${opacity}) 0%, transparent 70%)`,
          left: '20%',
          bottom: '-15%',
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -60, 30, 0],
          scale: [1, 1.08, 0.92, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 10,
        }}
      />
    </div>
  )
}
