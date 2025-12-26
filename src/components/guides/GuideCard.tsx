'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy, DollarSign, Zap, Gamepad2, Play,
  Briefcase, FileText, Users, Wifi
} from 'lucide-react'

// Category configuration with gradients and icons
const categoryConfig: Record<string, {
  gradient: string;
  iconGradient: string;
  hoverBorder: string;
  hoverShadow: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  'comparison': {
    gradient: 'from-cyan-500 to-blue-500',
    iconGradient: 'from-cyan-500 to-blue-500',
    hoverBorder: 'hover:border-cyan-500/30',
    hoverShadow: 'hover:shadow-cyan-500/10',
    Icon: Trophy,
  },
  'budget': {
    gradient: 'from-green-500 to-emerald-500',
    iconGradient: 'from-green-500 to-emerald-500',
    hoverBorder: 'hover:border-green-500/30',
    hoverShadow: 'hover:shadow-green-500/10',
    Icon: DollarSign,
  },
  'speed-guide': {
    gradient: 'from-cyan-500 to-purple-500',
    iconGradient: 'from-cyan-500 to-purple-500',
    hoverBorder: 'hover:border-purple-500/30',
    hoverShadow: 'hover:shadow-purple-500/10',
    Icon: Zap,
  },
  'gaming': {
    gradient: 'from-purple-500 to-pink-500',
    iconGradient: 'from-purple-500 to-pink-500',
    hoverBorder: 'hover:border-purple-500/30',
    hoverShadow: 'hover:shadow-purple-500/10',
    Icon: Gamepad2,
  },
  'streaming': {
    gradient: 'from-red-500 to-orange-500',
    iconGradient: 'from-red-500 to-orange-500',
    hoverBorder: 'hover:border-red-500/30',
    hoverShadow: 'hover:shadow-red-500/10',
    Icon: Play,
  },
  'work-from-home': {
    gradient: 'from-indigo-500 to-blue-500',
    iconGradient: 'from-indigo-500 to-blue-500',
    hoverBorder: 'hover:border-indigo-500/30',
    hoverShadow: 'hover:shadow-indigo-500/10',
    Icon: Briefcase,
  },
  'no-contracts': {
    gradient: 'from-orange-500 to-amber-500',
    iconGradient: 'from-orange-500 to-amber-500',
    hoverBorder: 'hover:border-orange-500/30',
    hoverShadow: 'hover:shadow-orange-500/10',
    Icon: FileText,
  },
  'family': {
    gradient: 'from-pink-500 to-rose-500',
    iconGradient: 'from-pink-500 to-rose-500',
    hoverBorder: 'hover:border-pink-500/30',
    hoverShadow: 'hover:shadow-pink-500/10',
    Icon: Users,
  },
}

const categoryLabels: Record<string, string> = {
  'budget': 'Budget-Friendly',
  'gaming': 'Gaming',
  'comparison': 'Comparison',
  'speed-guide': 'Speed Guide',
  'no-contracts': 'No Contract',
  'streaming': 'Streaming',
  'work-from-home': 'Work From Home',
  'family': 'Family',
}

interface GuideCardProps {
  slug: string
  title: string
  description: string
  category: string
  zipCode?: string
  index?: number
}

export function GuideCard({
  slug,
  title,
  description,
  category,
  zipCode,
  index = 0,
}: GuideCardProps) {
  const config = categoryConfig[category] || {
    gradient: 'from-gray-500 to-gray-600',
    iconGradient: 'from-gray-500 to-gray-600',
    hoverBorder: 'hover:border-gray-500/30',
    hoverShadow: 'hover:shadow-gray-500/10',
    Icon: Wifi,
  }

  const { Icon, gradient, iconGradient, hoverBorder, hoverShadow } = config
  const href = `/guides/${slug}${zipCode ? `?zip=${zipCode}` : ''}`

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        href={href}
        className={`group block relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 ${hoverBorder} ${hoverShadow} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full`}
      >
        {/* Background gradient on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />

        {/* Background glow orb */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

        <div className="relative">
          {/* Icon and Category */}
          <div className="flex items-start justify-between mb-4">
            {/* Gradient Icon */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${iconGradient} rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity`} />
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Category Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${gradient} text-white shadow-sm`}>
              {categoryLabels[category] || category}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
            {title}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-400 line-clamp-3 mb-4">
            {description}
          </p>

          {/* Read More Link */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-cyan-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Read Guide
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>

            {zipCode && (
              <span className="text-xs text-gray-500">{zipCode}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
