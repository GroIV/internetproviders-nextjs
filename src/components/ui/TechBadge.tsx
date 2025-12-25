'use client'

import { motion } from 'framer-motion'

type TechType = 'fiber' | 'cable' | '5g' | 'dsl' | 'satellite' | 'fixed-wireless'

interface TechBadgeProps {
  type: TechType
  showIcon?: boolean
  className?: string
}

const techConfig: Record<TechType, { label: string; icon: string }> = {
  fiber: { label: 'Fiber', icon: '⚡' },
  cable: { label: 'Cable', icon: '📡' },
  '5g': { label: '5G', icon: '📶' },
  dsl: { label: 'DSL', icon: '🔌' },
  satellite: { label: 'Satellite', icon: '🛰️' },
  'fixed-wireless': { label: 'Fixed Wireless', icon: '📻' },
}

export function TechBadge({ type, showIcon = true, className = '' }: TechBadgeProps) {
  const config = techConfig[type] || techConfig.cable

  return (
    <motion.span
      className={`tech-badge tech-badge-${type} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {showIcon && <span className="text-xs">{config.icon}</span>}
      {config.label}
    </motion.span>
  )
}

// Helper to convert technology string to badge type
export function getTechType(technology: string): TechType {
  const tech = technology.toLowerCase()
  if (tech.includes('fiber')) return 'fiber'
  if (tech.includes('cable')) return 'cable'
  if (tech.includes('5g') || tech.includes('lte')) return '5g'
  if (tech.includes('dsl')) return 'dsl'
  if (tech.includes('satellite')) return 'satellite'
  if (tech.includes('wireless') || tech.includes('fixed')) return 'fixed-wireless'
  return 'cable' // default
}
