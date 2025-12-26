'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ResultsCardProps {
  label: string
  value: string | number
  unit?: string
  icon: ReactNode
  color: 'cyan' | 'purple' | 'amber' | 'green' | 'blue' | 'pink'
  delay?: number
}

const colorConfig: Record<string, { gradient: string; glow: string; text: string }> = {
  cyan: {
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'group-hover:shadow-cyan-500/20',
    text: 'text-cyan-400'
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    glow: 'group-hover:shadow-purple-500/20',
    text: 'text-purple-400'
  },
  amber: {
    gradient: 'from-amber-500 to-yellow-500',
    glow: 'group-hover:shadow-amber-500/20',
    text: 'text-amber-400'
  },
  green: {
    gradient: 'from-green-500 to-emerald-500',
    glow: 'group-hover:shadow-green-500/20',
    text: 'text-green-400'
  },
  blue: {
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'group-hover:shadow-blue-500/20',
    text: 'text-blue-400'
  },
  pink: {
    gradient: 'from-pink-500 to-rose-500',
    glow: 'group-hover:shadow-pink-500/20',
    text: 'text-pink-400'
  }
}

export function ResultsCard({ label, value, unit, icon, color, delay = 0 }: ResultsCardProps) {
  const config = colorConfig[color]

  return (
    <motion.div
      className={`group relative bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 hover:border-gray-600/50 transition-all duration-300 shadow-lg ${config.glow} hover:shadow-xl`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Icon with gradient background */}
      <div className="relative mb-3">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition-opacity`} />
        <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${config.text}`}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-gray-500">{unit}</span>
        )}
      </div>

      {/* Label */}
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </motion.div>
  )
}
