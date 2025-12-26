'use client'

import { motion } from 'framer-motion'

interface GradeDisplayProps {
  grade: string
  description: string
}

const gradeConfig: Record<string, { gradient: string; glow: string; bg: string }> = {
  'A+': {
    gradient: 'from-emerald-400 to-green-500',
    glow: 'shadow-emerald-500/30',
    bg: 'bg-emerald-500/10'
  },
  'A': {
    gradient: 'from-green-400 to-emerald-500',
    glow: 'shadow-green-500/30',
    bg: 'bg-green-500/10'
  },
  'B': {
    gradient: 'from-cyan-400 to-blue-500',
    glow: 'shadow-cyan-500/30',
    bg: 'bg-cyan-500/10'
  },
  'C': {
    gradient: 'from-amber-400 to-yellow-500',
    glow: 'shadow-amber-500/30',
    bg: 'bg-amber-500/10'
  },
  'D': {
    gradient: 'from-orange-400 to-amber-500',
    glow: 'shadow-orange-500/30',
    bg: 'bg-orange-500/10'
  },
  'F': {
    gradient: 'from-red-400 to-rose-500',
    glow: 'shadow-red-500/30',
    bg: 'bg-red-500/10'
  }
}

export function calculateGrade(download: number, upload: number, latency: number, jitter: number): { grade: string; description: string } {
  let score = 0

  // Download (50 points max)
  if (download >= 300) score += 50
  else if (download >= 100) score += 40
  else if (download >= 50) score += 30
  else if (download >= 25) score += 20
  else score += 10

  // Upload (20 points max)
  if (upload >= 50) score += 20
  else if (upload >= 20) score += 15
  else if (upload >= 10) score += 10
  else score += 5

  // Latency (20 points max)
  if (latency <= 10) score += 20
  else if (latency <= 30) score += 15
  else if (latency <= 50) score += 10
  else score += 5

  // Jitter (10 points max)
  if (jitter <= 2) score += 10
  else if (jitter <= 5) score += 7
  else if (jitter <= 10) score += 4
  else score += 2

  // Grade and description mapping
  if (score >= 90) return { grade: 'A+', description: 'Exceptional connection - ready for anything' }
  if (score >= 80) return { grade: 'A', description: 'Excellent speeds for all activities' }
  if (score >= 70) return { grade: 'B', description: 'Good connection for most uses' }
  if (score >= 60) return { grade: 'C', description: 'Average speeds - may struggle with 4K' }
  if (score >= 50) return { grade: 'D', description: 'Below average - consider upgrading' }
  return { grade: 'F', description: 'Poor connection - upgrade recommended' }
}

export function GradeDisplay({ grade, description }: GradeDisplayProps) {
  const config = gradeConfig[grade] || gradeConfig['C']

  return (
    <motion.div
      className={`relative ${config.bg} backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 text-center overflow-hidden`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
    >
      {/* Background glow */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-10 blur-3xl`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Content */}
      <div className="relative">
        <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
          Connection Quality
        </div>

        {/* Grade */}
        <motion.div
          className={`text-7xl font-black bg-gradient-to-br ${config.gradient} bg-clip-text text-transparent`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {grade}
        </motion.div>

        {/* Description */}
        <motion.div
          className="text-sm text-gray-300 mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {description}
        </motion.div>
      </div>
    </motion.div>
  )
}
