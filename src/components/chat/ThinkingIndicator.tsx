'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const thinkingPhrases = [
  "Analyzing your request...",
  "Searching providers...",
  "Checking availability...",
  "Finding best options...",
  "Comparing plans...",
]

export function ThinkingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % thinkingPhrases.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 bg-gray-800/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-700/50">
        {/* Pulsing Orb */}
        <div className="relative w-8 h-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 thinking-ring" />

          {/* Inner orb */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 thinking-orb" />

          {/* Center highlight */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-white/50" />
        </div>

        {/* Animated text */}
        <div className="min-w-[140px]">
          <AnimatePresence mode="wait">
            <motion.span
              key={phraseIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-gray-400"
            >
              {thinkingPhrases[phraseIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
