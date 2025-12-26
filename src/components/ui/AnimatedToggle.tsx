'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg'

interface AnimatedToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: Size
  disabled?: boolean
  label?: string
  activeColor?: string
  className?: string
}

const sizes: Record<Size, { track: string; knob: string; translate: number }> = {
  sm: { track: 'w-8 h-4', knob: 'w-3 h-3', translate: 16 },
  md: { track: 'w-12 h-6', knob: 'w-4 h-4', translate: 24 },
  lg: { track: 'w-16 h-8', knob: 'w-6 h-6', translate: 32 },
}

export function AnimatedToggle({
  checked,
  onChange,
  size = 'md',
  disabled = false,
  label,
  activeColor = 'cyan',
  className = '',
}: AnimatedToggleProps) {
  const sizeConfig = sizes[size]

  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
  }

  const glowColors: Record<string, string> = {
    cyan: '0 0 15px rgba(6, 182, 212, 0.5)',
    blue: '0 0 15px rgba(59, 130, 246, 0.5)',
    purple: '0 0 15px rgba(139, 92, 246, 0.5)',
    pink: '0 0 15px rgba(236, 72, 153, 0.5)',
    orange: '0 0 15px rgba(249, 115, 22, 0.5)',
    emerald: '0 0 15px rgba(16, 185, 129, 0.5)',
  }

  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex items-center rounded-full p-1 flex-shrink-0
          transition-colors duration-200
          ${sizeConfig.track}
          ${checked ? colorClasses[activeColor] : 'bg-gray-600'}
        `}
        animate={{
          boxShadow: checked ? glowColors[activeColor] : '0 0 0px rgba(0, 0, 0, 0)',
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={`${sizeConfig.knob} rounded-full bg-white shadow-md`}
          animate={{
            x: checked ? sizeConfig.translate - (size === 'sm' ? 4 : size === 'md' ? 8 : 8) : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </motion.button>
      {label && (
        <span className="text-sm text-gray-300">{label}</span>
      )}
    </label>
  )
}
