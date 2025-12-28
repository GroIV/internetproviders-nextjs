'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getProviderLogoInfo } from '@/lib/providerLogos'

interface ProviderLogoProps {
  slug: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32',
}

const sizePx = {
  sm: 40,
  md: 56,
  lg: 80,
  xl: 96,
  '2xl': 128,
}

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl',
  '2xl': 'text-3xl',
}

export function ProviderLogo({ slug, name, size = 'md', className = '' }: ProviderLogoProps) {
  const [imageError, setImageError] = useState(false)
  const logoInfo = getProviderLogoInfo(slug, name)

  const containerClass = `${sizeClasses[size]} rounded-lg flex items-center justify-center overflow-hidden ${className}`

  // Show fallback if no logo or image failed to load
  if (!logoInfo.hasLogo || imageError) {
    return (
      <div className={`${containerClass} ${logoInfo.fallbackBg}`}>
        <span className={`${textSizes[size]} font-bold ${logoInfo.fallbackText}`}>
          {logoInfo.initials}
        </span>
      </div>
    )
  }

  // Determine background class based on logo requirements
  const bgClass = logoInfo.needsLightBg ? 'bg-white' : 'bg-gray-800'

  return (
    <div className={`${containerClass} ${bgClass} p-1.5`}>
      <Image
        src={logoInfo.logoPath!}
        alt={`${name} logo`}
        width={sizePx[size]}
        height={sizePx[size]}
        className="object-contain w-full h-full"
        onError={() => setImageError(true)}
      />
    </div>
  )
}
