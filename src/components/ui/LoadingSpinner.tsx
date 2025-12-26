'use client'

import { motion } from 'framer-motion'

type Variant = 'dots' | 'orbital' | 'pulse' | 'bars'
type Size = 'sm' | 'md' | 'lg'

interface LoadingSpinnerProps {
  variant?: Variant
  size?: Size
  color?: string
  className?: string
}

const sizes: Record<Size, number> = {
  sm: 20,
  md: 32,
  lg: 48,
}

function DotsSpinner({ size, color }: { size: number; color: string }) {
  const dotSize = size / 4

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            boxShadow: `0 0 ${dotSize}px ${color}`,
          }}
          animate={{
            y: [-dotSize / 2, dotSize / 2, -dotSize / 2],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function OrbitalSpinner({ size, color }: { size: number; color: string }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Track */}
      <div
        className="absolute inset-0 rounded-full border-2 opacity-20"
        style={{ borderColor: color }}
      />
      {/* Orbiting dot */}
      <motion.div
        className="absolute"
        style={{
          width: size / 4,
          height: size / 4,
          left: size / 2 - size / 8,
          top: -size / 8,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 ${size / 4}px ${color}`,
            transform: `translateY(${size / 2 - size / 8}px)`,
          }}
        />
      </motion.div>
      {/* Center glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size / 3,
          height: size / 3,
          left: size / 3,
          top: size / 3,
          backgroundColor: color,
          opacity: 0.3,
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
    </div>
  )
}

function PulseSpinner({ size, color }: { size: number; color: string }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${color}`,
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
      <div
        className="absolute rounded-full"
        style={{
          width: size / 3,
          height: size / 3,
          left: size / 3,
          top: size / 3,
          backgroundColor: color,
          boxShadow: `0 0 ${size / 2}px ${color}`,
        }}
      />
    </div>
  )
}

function BarsSpinner({ size, color }: { size: number; color: string }) {
  const barWidth = size / 6
  const barHeight = size

  return (
    <div className="flex items-end gap-0.5" style={{ height: size }}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="rounded-sm"
          style={{
            width: barWidth,
            backgroundColor: color,
            boxShadow: `0 0 ${barWidth}px ${color}`,
          }}
          animate={{
            height: [barHeight * 0.3, barHeight, barHeight * 0.3],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function LoadingSpinner({
  variant = 'orbital',
  size = 'md',
  color = '#06b6d4',
  className = '',
}: LoadingSpinnerProps) {
  const pixelSize = sizes[size]

  const spinners = {
    dots: DotsSpinner,
    orbital: OrbitalSpinner,
    pulse: PulseSpinner,
    bars: BarsSpinner,
  }

  const SpinnerComponent = spinners[variant]

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <SpinnerComponent size={pixelSize} color={color} />
    </div>
  )
}
