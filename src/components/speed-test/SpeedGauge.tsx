'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

type TestPhase = 'idle' | 'latency' | 'download' | 'upload' | 'complete'

interface SpeedGaugeProps {
  phase: TestPhase
  currentSpeed: number
  progress: number
}

const phaseConfig: Record<TestPhase, {
  gradient: string
  glow: string
  label: string
  ring: string
}> = {
  idle: {
    gradient: 'from-gray-500 to-gray-600',
    glow: 'shadow-gray-500/0',
    label: 'Ready',
    ring: 'stroke-gray-700'
  },
  latency: {
    gradient: 'from-amber-400 to-yellow-500',
    glow: 'shadow-amber-500/30',
    label: 'Analyzing Connection',
    ring: 'stroke-amber-500'
  },
  download: {
    gradient: 'from-cyan-400 to-blue-500',
    glow: 'shadow-cyan-500/30',
    label: 'Testing Download',
    ring: 'stroke-cyan-500'
  },
  upload: {
    gradient: 'from-purple-400 to-pink-500',
    glow: 'shadow-purple-500/30',
    label: 'Testing Upload',
    ring: 'stroke-purple-500'
  },
  complete: {
    gradient: 'from-green-400 to-emerald-500',
    glow: 'shadow-green-500/30',
    label: 'Complete',
    ring: 'stroke-green-500'
  }
}

// Smooth number animation hook
function useAnimatedNumber(value: number, duration: number = 300) {
  const [displayValue, setDisplayValue] = useState(value)
  const animationRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)
  const startValueRef = useRef<number>(value)

  useEffect(() => {
    startValueRef.current = displayValue
    startTimeRef.current = Date.now()

    const animate = () => {
      const elapsed = Date.now() - (startTimeRef.current || 0)
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const newValue = startValueRef.current + (value - startValueRef.current) * eased

      setDisplayValue(newValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- displayValue intentionally read once at animation start
  }, [value, duration])

  return displayValue
}

export function SpeedGauge({ phase, currentSpeed, progress }: SpeedGaugeProps) {
  const config = phaseConfig[phase]
  const animatedSpeed = useAnimatedNumber(currentSpeed, 200)
  const animatedProgress = useAnimatedNumber(progress, 300)

  // Calculate arc parameters
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.75 // 270 degrees
  const progressOffset = arcLength - (arcLength * (animatedProgress / 100))

  return (
    <div className="relative w-72 h-72 mx-auto">
      {/* Outer glow ring - pulses during test */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} opacity-20 blur-xl`}
        animate={{
          scale: phase !== 'idle' && phase !== 'complete' ? [1, 1.1, 1] : 1,
          opacity: phase !== 'idle' && phase !== 'complete' ? [0.2, 0.3, 0.2] : 0.1,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Glassmorphism container */}
      <div className="absolute inset-4 rounded-full bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
        {/* SVG Gauge */}
        <svg className="w-full h-full transform -rotate-[135deg]" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="6"
            className="stroke-gray-800"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Progress arc with gradient */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="6"
            className={config.ring}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            style={{
              filter: phase !== 'idle' ? `drop-shadow(0 0 8px currentColor)` : 'none'
            }}
          />

          {/* Tick marks */}
          {[...Array(9)].map((_, i) => {
            const angle = -135 + (i * 33.75)
            const rad = (angle * Math.PI) / 180
            const innerR = 38
            const outerR = 41
            const x1 = 50 + innerR * Math.cos(rad)
            const y1 = 50 + innerR * Math.sin(rad)
            const x2 = 50 + outerR * Math.cos(rad)
            const y2 = 50 + outerR * Math.sin(rad)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="stroke-gray-600"
                strokeWidth="1"
              />
            )
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Speed display */}
          <motion.div
            className={`text-5xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
            key={phase}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {phase === 'idle' ? '0' : animatedSpeed.toFixed(1)}
          </motion.div>

          {/* Unit */}
          <div className="text-gray-400 text-sm font-medium mt-1">Mbps</div>

          {/* Phase label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-sm mt-3 font-medium bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
            >
              {config.label}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Speed scale labels */}
      <div className="absolute bottom-2 left-4 text-xs text-gray-500">0</div>
      <div className="absolute bottom-2 right-4 text-xs text-gray-500">500+</div>
    </div>
  )
}
