'use client'

import React from 'react'
import { motion } from 'framer-motion'

export type AIMood = 'neutral' | 'thinking' | 'happy' | 'helpful'

interface AIAvatarProps {
  mood?: AIMood
  isThinking?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const moodGradients: Record<AIMood, string> = {
  neutral: 'from-blue-500 to-cyan-500',
  thinking: 'from-purple-500 to-blue-500',
  happy: 'from-green-400 to-cyan-500',
  helpful: 'from-blue-400 to-indigo-500',
}

const sizeConfig = {
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { container: 'w-14 h-14', icon: 'w-7 h-7' },
}

export function AIAvatar({
  mood = 'neutral',
  isThinking = false,
  size = 'md',
  className = ''
}: AIAvatarProps) {
  const { container, icon } = sizeConfig[size]
  const gradient = moodGradients[mood]

  return (
    <div className={`relative ${container} ${className}`}>
      {/* Outer pulse ring */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} ${isThinking ? 'avatar-pulse-fast' : 'avatar-pulse'}`}
      />

      {/* Rotating ring 1 */}
      <div
        className={`absolute inset-0 rounded-full border-2 border-transparent ${isThinking ? 'avatar-ring' : ''}`}
        style={{
          borderTopColor: 'rgba(59, 130, 246, 0.6)',
          borderRightColor: 'rgba(6, 182, 212, 0.3)',
        }}
      />

      {/* Rotating ring 2 (smaller, reverse) */}
      <div
        className={`absolute inset-1 rounded-full border border-transparent ${isThinking ? 'avatar-ring-reverse' : ''}`}
        style={{
          borderTopColor: 'rgba(6, 182, 212, 0.5)',
          borderLeftColor: 'rgba(139, 92, 246, 0.3)',
        }}
      />

      {/* Core orb */}
      <motion.div
        className={`absolute inset-2 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
        animate={isThinking ? { scale: [1, 0.95, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        {/* Icon based on mood */}
        <AIIcon mood={mood} isThinking={isThinking} className={icon} />

        {/* Highlight */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/40" />
      </motion.div>
    </div>
  )
}

function AIIcon({ mood, isThinking, className }: { mood: AIMood; isThinking: boolean; className: string }) {
  if (isThinking) {
    return (
      <motion.svg
        className={`${className} text-white`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </motion.svg>
    )
  }

  const icons: Record<AIMood, React.ReactNode> = {
    neutral: (
      <svg className={`${className} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    thinking: (
      <svg className={`${className} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    happy: (
      <svg className={`${className} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    helpful: (
      <svg className={`${className} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  }

  return icons[mood]
}
