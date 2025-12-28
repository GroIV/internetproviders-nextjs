'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getProviderLogoInfo } from '@/lib/providerLogos'

interface ProviderLogoProps {
  slug: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
}

const sizePx = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
}

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-xl',
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
