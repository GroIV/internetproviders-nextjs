'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AuroraBlobsProps {
  className?: string
  opacity?: number
}

// HSL colors for the aurora blobs - Expanded palette
const BLOB_COLORS = [
  { h: 217, s: 91, l: 60 },  // Blue
  { h: 180, s: 100, l: 43 }, // Cyan
  { h: 262, s: 83, l: 58 },  // Purple
  { h: 330, s: 80, l: 60 },  // Pink/Magenta
  { h: 25, s: 95, l: 53 },   // Orange
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

      {/* Blob 4 - Pink/Magenta, top-right area */}
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, hsla(${BLOB_COLORS[3].h}, ${BLOB_COLORS[3].s}%, ${BLOB_COLORS[3].l}%, ${opacity}) 0%, transparent 70%)`,
          right: '15%',
          top: '-5%',
        }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 70, -20, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />

      {/* Blob 5 - Orange, bottom-right area */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, hsla(${BLOB_COLORS[4].h}, ${BLOB_COLORS[4].s}%, ${BLOB_COLORS[4].l}%, ${opacity}) 0%, transparent 70%)`,
          right: '-5%',
          bottom: '10%',
        }}
        animate={{
          x: [0, -70, 40, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.05, 0.9, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 8,
        }}
      />
    </div>
  )
}
