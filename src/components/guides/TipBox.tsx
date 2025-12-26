'use client'

import { motion } from 'framer-motion'
import { Lightbulb, AlertTriangle, Sparkles, CheckCircle } from 'lucide-react'

type TipVariant = 'tip' | 'warning' | 'pro-tip' | 'success'

const variantConfig: Record<TipVariant, {
  gradient: string;
  iconBg: string;
  borderColor: string;
  glowColor: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = {
  'tip': {
    gradient: 'from-cyan-500 to-blue-500',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    borderColor: 'border-cyan-500/30',
    glowColor: 'shadow-cyan-500/20',
    Icon: Lightbulb,
    label: 'Tip',
  },
  'warning': {
    gradient: 'from-orange-500 to-amber-500',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
    borderColor: 'border-orange-500/30',
    glowColor: 'shadow-orange-500/20',
    Icon: AlertTriangle,
    label: 'Warning',
  },
  'pro-tip': {
    gradient: 'from-purple-500 to-pink-500',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/30',
    glowColor: 'shadow-purple-500/20',
    Icon: Sparkles,
    label: 'Pro Tip',
  },
  'success': {
    gradient: 'from-green-500 to-emerald-500',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
    borderColor: 'border-green-500/30',
    glowColor: 'shadow-green-500/20',
    Icon: CheckCircle,
    label: 'Success',
  },
}

interface TipBoxProps {
  variant?: TipVariant
  title?: string
  children: React.ReactNode
}

export function TipBox({
  variant = 'tip',
  title,
  children,
}: TipBoxProps) {
  const config = variantConfig[variant]
  const { Icon, iconBg, borderColor, glowColor, gradient, label } = config

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`relative bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 border ${borderColor} shadow-lg ${glowColor} overflow-hidden`}
    >
      {/* Background glow */}
      <div className={`absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-10`} />

      <div className="relative flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className={`absolute inset-0 ${iconBg} rounded-lg blur-md opacity-40`} />
            <div className={`relative w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm mb-1 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {title || label}
          </h4>
          <div className="text-sm text-gray-300 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
