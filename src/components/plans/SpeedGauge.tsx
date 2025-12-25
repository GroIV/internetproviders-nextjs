'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface SpeedGaugeProps {
  speed: number // in Mbps
  maxSpeed?: number // for scaling, default 5000
  label?: string
  size?: 'sm' | 'md' | 'lg'
  colorClass?: string
}

export function SpeedGauge({
  speed,
  maxSpeed = 5000,
  label = 'Mbps',
  size = 'md',
  colorClass = 'cyan'
}: SpeedGaugeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [animatedSpeed, setAnimatedSpeed] = useState(0)

  // Size configurations
  const sizeConfig = {
    sm: { width: 80, strokeWidth: 6, fontSize: 'text-lg', labelSize: 'text-[10px]' },
    md: { width: 120, strokeWidth: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
    lg: { width: 160, strokeWidth: 10, fontSize: 'text-3xl', labelSize: 'text-sm' }
  }

  const config = sizeConfig[size]
  const radius = (config.width - config.strokeWidth) / 2
  const circumference = radius * Math.PI // Half circle

  // Calculate percentage (use log scale for better visualization of wide range)
  const logSpeed = speed > 0 ? Math.log10(speed) : 0
  const logMax = Math.log10(maxSpeed)
  const percentage = Math.min((logSpeed / logMax) * 100, 100)
  const offset = circumference - (percentage / 100) * circumference

  // Color gradients based on tier
  const colorGradients: Record<string, { start: string; end: string; glow: string }> = {
    green: { start: '#10b981', end: '#34d399', glow: 'rgba(16, 185, 129, 0.5)' },
    cyan: { start: '#06b6d4', end: '#22d3ee', glow: 'rgba(6, 182, 212, 0.5)' },
    purple: { start: '#8b5cf6', end: '#a78bfa', glow: 'rgba(139, 92, 246, 0.5)' },
    blue: { start: '#3b82f6', end: '#60a5fa', glow: 'rgba(59, 130, 246, 0.5)' }
  }

  const colors = colorGradients[colorClass] || colorGradients.cyan

  // Animate speed counter when in view
  useEffect(() => {
    if (isInView) {
      const duration = 1500
      const steps = 60
      const stepValue = speed / steps
      let current = 0
      const timer = setInterval(() => {
        current += stepValue
        if (current >= speed) {
          setAnimatedSpeed(speed)
          clearInterval(timer)
        } else {
          setAnimatedSpeed(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [isInView, speed])

  // Format speed for display
  const formatSpeed = (s: number) => {
    if (s >= 1000) {
      return (s / 1000).toFixed(s >= 10000 ? 0 : 1)
    }
    return s.toString()
  }

  const displayUnit = speed >= 1000 ? 'Gbps' : label

  return (
    <div ref={ref} className="relative inline-flex flex-col items-center">
      <svg
        width={config.width}
        height={config.width / 2 + 10}
        className="transform -rotate-0"
      >
        <defs>
          <linearGradient id={`gauge-gradient-${colorClass}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
          <filter id={`gauge-glow-${colorClass}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.width / 2}
              A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
          fill="none"
          stroke="rgba(75, 85, 99, 0.3)"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />

        {/* Animated progress arc */}
        <motion.path
          d={`M ${config.strokeWidth / 2} ${config.width / 2}
              A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
          fill="none"
          stroke={`url(#gauge-gradient-${colorClass})`}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          filter={`url(#gauge-glow-${colorClass})`}
        />

        {/* Speed markers */}
        {[0, 25, 50, 75, 100].map((tick, i) => {
          const angle = (tick / 100) * 180 - 180
          const radians = (angle * Math.PI) / 180
          const innerRadius = radius - config.strokeWidth - 4
          const outerRadius = radius - config.strokeWidth - 8
          const x1 = config.width / 2 + innerRadius * Math.cos(radians)
          const y1 = config.width / 2 + innerRadius * Math.sin(radians)
          const x2 = config.width / 2 + outerRadius * Math.cos(radians)
          const y2 = config.width / 2 + outerRadius * Math.sin(radians)

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(156, 163, 175, 0.4)"
              strokeWidth={1}
            />
          )
        })}
      </svg>

      {/* Speed value display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <motion.div
          className={`${config.fontSize} font-bold tabular-nums`}
          style={{ color: colors.start }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          {formatSpeed(animatedSpeed)}
        </motion.div>
        <div className={`${config.labelSize} text-gray-400 -mt-1`}>{displayUnit}</div>
      </div>
    </div>
  )
}
