'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface QuickActionButtonProps {
  label: string
  onClick: () => void
  index?: number
  className?: string
}

export function QuickActionButton({
  label,
  onClick,
  index = 0,
  className = ''
}: QuickActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = () => {
    setIsPressed(true)
    setTimeout(() => {
      onClick()
    }, 150)
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`
        relative px-3 py-1.5 text-xs
        bg-gray-800/80 backdrop-blur-sm
        text-gray-300 rounded-full
        border border-gray-700/50
        overflow-hidden
        transition-colors duration-200
        hover:bg-gray-700/80 hover:text-white hover:border-gray-600
        quick-action-shimmer
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Ripple effect on click */}
      {isPressed && (
        <motion.span
          className="absolute inset-0 bg-blue-500/30 rounded-full"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
          onAnimationComplete={() => setIsPressed(false)}
        />
      )}

      {/* Gradient underline on hover */}
      <motion.span
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.2 }}
      />

      <span className="relative z-10">{label}</span>
    </motion.button>
  )
}
