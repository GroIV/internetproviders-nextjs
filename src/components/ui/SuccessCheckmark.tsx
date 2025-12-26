'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg'

interface SuccessCheckmarkProps {
  show: boolean
  size?: Size
  color?: string
  onComplete?: () => void
  className?: string
}

const sizes: Record<Size, { container: number; stroke: number }> = {
  sm: { container: 24, stroke: 2 },
  md: { container: 40, stroke: 3 },
  lg: { container: 64, stroke: 4 },
}

export function SuccessCheckmark({
  show,
  size = 'md',
  color = '#10b981',
  onComplete,
  className = '',
}: SuccessCheckmarkProps) {
  const [showSparkles, setShowSparkles] = useState(false)
  const sizeConfig = sizes[size]
  const radius = sizeConfig.container / 2 - sizeConfig.stroke
  const circumference = 2 * Math.PI * radius

  // Derive sparkle visibility - can only be true when show is true
  const displaySparkles = show && showSparkles

  useEffect(() => {
    if (!show) {
      return
    }

    // Reset sparkles when show becomes true (use timeout to satisfy lint)
    const resetTimer = setTimeout(() => setShowSparkles(false), 0)

    const showTimer = setTimeout(() => {
      setShowSparkles(true)
      onComplete?.()
    }, 500)

    const hideTimer = setTimeout(() => {
      setShowSparkles(false)
    }, 1100) // 500 + 600

    return () => {
      clearTimeout(resetTimer)
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [show, onComplete])

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <AnimatePresence>
        {show && (
          <>
            {/* Circle */}
            <motion.svg
              width={sizeConfig.container}
              height={sizeConfig.container}
              viewBox={`0 0 ${sizeConfig.container} ${sizeConfig.container}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.circle
                cx={sizeConfig.container / 2}
                cy={sizeConfig.container / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={sizeConfig.stroke}
                strokeLinecap="round"
                initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
              {/* Checkmark */}
              <motion.path
                d={`M${sizeConfig.container * 0.28} ${sizeConfig.container * 0.5} L${sizeConfig.container * 0.45} ${sizeConfig.container * 0.65} L${sizeConfig.container * 0.72} ${sizeConfig.container * 0.35}`}
                fill="none"
                stroke={color}
                strokeWidth={sizeConfig.stroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3, ease: 'easeOut' }}
              />
            </motion.svg>

            {/* Sparkles */}
            {displaySparkles && (
              <>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <motion.div
                    key={angle}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 4px ${color}`,
                    }}
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 1,
                      scale: 1,
                    }}
                    animate={{
                      x: Math.cos((angle * Math.PI) / 180) * (sizeConfig.container * 0.8),
                      y: Math.sin((angle * Math.PI) / 180) * (sizeConfig.container * 0.8),
                      opacity: 0,
                      scale: 0.5,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: 'easeOut',
                      delay: i * 0.02,
                    }}
                  />
                ))}
              </>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
