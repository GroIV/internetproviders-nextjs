'use client'

import { motion } from 'framer-motion'

type TestPhase = 'idle' | 'latency' | 'download' | 'upload' | 'complete'

interface PhaseTimelineProps {
  currentPhase: TestPhase
}

const phases: { id: TestPhase; label: string; color: string }[] = [
  { id: 'latency', label: 'Ping', color: 'amber' },
  { id: 'download', label: 'Download', color: 'cyan' },
  { id: 'upload', label: 'Upload', color: 'purple' },
  { id: 'complete', label: 'Done', color: 'green' }
]

const phaseColors: Record<string, { active: string; dot: string; line: string }> = {
  amber: { active: 'bg-amber-500', dot: 'border-amber-500', line: 'bg-amber-500' },
  cyan: { active: 'bg-cyan-500', dot: 'border-cyan-500', line: 'bg-cyan-500' },
  purple: { active: 'bg-purple-500', dot: 'border-purple-500', line: 'bg-purple-500' },
  green: { active: 'bg-green-500', dot: 'border-green-500', line: 'bg-green-500' }
}

export function PhaseTimeline({ currentPhase }: PhaseTimelineProps) {
  const currentIndex = phases.findIndex(p => p.id === currentPhase)

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative flex items-center justify-between">
        {/* Connection line background */}
        <div className="absolute left-0 right-0 h-0.5 bg-gray-700 top-1/2 -translate-y-1/2 z-0" />

        {/* Progress line */}
        <motion.div
          className="absolute left-0 h-0.5 bg-gradient-to-r from-amber-500 via-cyan-500 to-purple-500 top-1/2 -translate-y-1/2 z-0"
          initial={{ width: '0%' }}
          animate={{
            width: currentPhase === 'idle' ? '0%' :
                   currentPhase === 'latency' ? '15%' :
                   currentPhase === 'download' ? '45%' :
                   currentPhase === 'upload' ? '75%' :
                   '100%'
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {/* Phase dots */}
        {phases.map((phase, index) => {
          const isPast = index < currentIndex || currentPhase === 'complete'
          const isCurrent = phase.id === currentPhase
          const colors = phaseColors[phase.color]

          return (
            <div key={phase.id} className="relative z-10 flex flex-col items-center">
              {/* Dot */}
              <motion.div
                className={`w-4 h-4 rounded-full border-2 ${
                  isPast || isCurrent ? colors.dot : 'border-gray-600'
                } ${
                  isPast ? colors.active : 'bg-gray-900'
                }`}
                animate={{
                  scale: isCurrent ? [1, 1.2, 1] : 1,
                  boxShadow: isCurrent ? `0 0 12px ${phase.color === 'amber' ? '#f59e0b' : phase.color === 'cyan' ? '#06b6d4' : phase.color === 'purple' ? '#a855f7' : '#10b981'}` : 'none'
                }}
                transition={{
                  scale: { duration: 1, repeat: isCurrent ? Infinity : 0 },
                  boxShadow: { duration: 0.3 }
                }}
              >
                {isPast && (
                  <motion.svg
                    className="w-full h-full text-white p-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                className={`text-xs mt-2 font-medium ${
                  isPast || isCurrent ? 'text-gray-300' : 'text-gray-500'
                }`}
                animate={{
                  color: isCurrent ? (
                    phase.color === 'amber' ? '#fbbf24' :
                    phase.color === 'cyan' ? '#22d3ee' :
                    phase.color === 'purple' ? '#c084fc' :
                    '#34d399'
                  ) : isPast ? '#d1d5db' : '#6b7280'
                }}
              >
                {phase.label}
              </motion.span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
