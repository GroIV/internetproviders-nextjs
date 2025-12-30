'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PanelWrapperProps {
  title: string
  icon?: ReactNode
  onClose?: () => void
  children: ReactNode
  className?: string
  accentColor?: 'cyan' | 'blue' | 'purple' | 'green'
}

const accentColors = {
  cyan: 'from-cyan-500/20 to-transparent border-cyan-500/30',
  blue: 'from-blue-500/20 to-transparent border-blue-500/30',
  purple: 'from-purple-500/20 to-transparent border-purple-500/30',
  green: 'from-green-500/20 to-transparent border-green-500/30',
}

const panelVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 }
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
}

export function PanelWrapper({
  title,
  icon,
  onClose,
  children,
  className = '',
  accentColor = 'cyan'
}: PanelWrapperProps) {
  return (
    <motion.div
      className={`command-panel rounded-xl overflow-hidden ${className}`}
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      {/* Header */}
      <div className={`command-panel-header px-4 py-3 flex items-center justify-between bg-gradient-to-r ${accentColors[accentColor]}`}>
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-gray-400">
              {icon}
            </span>
          )}
          <h3 className="font-semibold text-white text-sm">{title}</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-700/50 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  )
}
