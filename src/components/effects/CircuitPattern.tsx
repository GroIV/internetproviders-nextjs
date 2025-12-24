'use client'

import { motion } from 'framer-motion'

interface CircuitPatternProps {
  className?: string
  opacity?: number
  animated?: boolean
}

export function CircuitPattern({
  className = '',
  opacity = 0.08,
  animated = true,
}: CircuitPatternProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Circuit SVG Pattern */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="circuit-pattern"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            {/* Horizontal lines */}
            <path
              d="M0 50 H30 M70 50 H100"
              stroke="#06b6d4"
              strokeWidth="1"
              fill="none"
            />
            {/* Vertical lines */}
            <path
              d="M50 0 V30 M50 70 V100"
              stroke="#06b6d4"
              strokeWidth="1"
              fill="none"
            />
            {/* Center node */}
            <circle cx="50" cy="50" r="4" fill="none" stroke="#06b6d4" strokeWidth="1" />
            <circle cx="50" cy="50" r="2" fill="#06b6d4" />
            {/* Corner nodes */}
            <circle cx="0" cy="50" r="2" fill="#06b6d4" />
            <circle cx="100" cy="50" r="2" fill="#06b6d4" />
            <circle cx="50" cy="0" r="2" fill="#06b6d4" />
            <circle cx="50" cy="100" r="2" fill="#06b6d4" />
            {/* Diagonal connections */}
            <path
              d="M30 50 L50 30 M50 70 L70 50"
              stroke="#06b6d4"
              strokeWidth="0.5"
              fill="none"
            />
          </pattern>

          {/* Animated pulse gradient */}
          <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
      </svg>

      {/* Animated data pulses */}
      {animated && (
        <>
          {/* Horizontal pulse */}
          <motion.div
            className="absolute h-[2px] w-20"
            style={{
              background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
              top: '30%',
              left: 0,
            }}
            animate={{
              x: ['0%', '500%'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              delay: 0,
            }}
          />
          <motion.div
            className="absolute h-[2px] w-20"
            style={{
              background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
              top: '60%',
              right: 0,
            }}
            animate={{
              x: ['0%', '-500%'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
              delay: 2,
            }}
          />
          {/* Vertical pulse */}
          <motion.div
            className="absolute w-[2px] h-20"
            style={{
              background: 'linear-gradient(180deg, transparent, #06b6d4, transparent)',
              left: '25%',
              top: 0,
            }}
            animate={{
              y: ['0%', '500%'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'linear',
              delay: 1,
            }}
          />
          <motion.div
            className="absolute w-[2px] h-20"
            style={{
              background: 'linear-gradient(180deg, transparent, #8b5cf6, transparent)',
              right: '30%',
              bottom: 0,
            }}
            animate={{
              y: ['0%', '-500%'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
              delay: 3,
            }}
          />
        </>
      )}

      {/* Glowing nodes at random positions */}
      {animated && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0 ? '#06b6d4' : '#3b82f6',
                boxShadow: `0 0 10px ${i % 2 === 0 ? '#06b6d4' : '#3b82f6'}`,
                left: `${15 + i * 18}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
