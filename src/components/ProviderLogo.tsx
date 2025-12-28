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
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-28 h-28',
  xl: 'w-36 h-36',
  '2xl': 'w-44 h-44',
}

const sizePx = {
  sm: 56,
  md: 80,
  lg: 112,
  xl: 144,
  '2xl': 176,
}

const textSizes = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
  '2xl': 'text-4xl',
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
