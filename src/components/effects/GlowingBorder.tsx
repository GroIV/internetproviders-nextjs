'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlowingBorderProps {
  children: ReactNode
  color?: 'blue' | 'cyan' | 'purple' | 'gradient'
  animated?: boolean
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

const colorClasses = {
  blue: {
    border: 'border-blue-500/40',
    shadow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)',
    hoverShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.2)',
  },
  cyan: {
    border: 'border-cyan-500/40',
    shadow: '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.1)',
    hoverShadow: '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.2)',
  },
  purple: {
    border: 'border-purple-500/40',
    shadow: '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
    hoverShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2)',
  },
  gradient: {
    border: 'border-transparent',
    shadow: '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)',
    hoverShadow: '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)',
  },
}

const intensityMultipliers = {
  low: 0.5,
  medium: 1,
  high: 1.5,
}

export function GlowingBorder({
  children,
  color = 'cyan',
  animated = false,
  intensity = 'medium',
  className = '',
}: GlowingBorderProps) {
  const colorConfig = colorClasses[color]
  const multiplier = intensityMultipliers[intensity]

  return (
    <motion.div
      className={`relative rounded-xl border ${colorConfig.border} ${className}`}
      initial={{ boxShadow: colorConfig.shadow }}
      whileHover={{
        boxShadow: colorConfig.hoverShadow,
        scale: 1.02,
      }}
      animate={animated ? {
        boxShadow: [
          colorConfig.shadow,
          colorConfig.hoverShadow,
          colorConfig.shadow,
        ],
      } : undefined}
      transition={animated ? {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      } : {
        duration: 0.3,
      }}
      style={{
        '--intensity': multiplier,
      } as React.CSSProperties}
    >
      {/* Gradient border overlay for gradient mode */}
      {color === 'gradient' && (
        <div className="absolute inset-0 rounded-xl p-[1px] pointer-events-none">
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(6, 182, 212, 0.5) 50%, rgba(139, 92, 246, 0.5) 100%)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              padding: '1px',
            }}
          />
        </div>
      )}
      {children}
    </motion.div>
  )
}
