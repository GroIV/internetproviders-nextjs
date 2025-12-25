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
      <div className="flex items-center gap-4 bg-gray-800/80 backdrop-blur-sm rounded-2xl px-5 py-4 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
        {/* Enhanced Orbital Thinking Animation */}
        <div className="relative w-10 h-10">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-md animate-pulse" />

          {/* Orbital ring 1 */}
          <motion.div
            className="absolute inset-0 rounded-full border border-cyan-500/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
          </motion.div>

          {/* Orbital ring 2 (counter-rotate) */}
          <motion.div
            className="absolute inset-1 rounded-full border border-blue-500/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
          </motion.div>

          {/* Inner pulsing core */}
          <motion.div
            className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Center highlight */}
          <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-white/60" />
        </div>

        {/* Animated text with gradient */}
        <div className="min-w-[150px]">
          <AnimatePresence mode="wait">
            <motion.span
              key={phraseIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-sm bg-gradient-to-r from-gray-300 to-cyan-300 bg-clip-text text-transparent font-medium"
            >
              {thinkingPhrases[phraseIndex]}
            </motion.span>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex gap-1 mt-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-cyan-500/60"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
