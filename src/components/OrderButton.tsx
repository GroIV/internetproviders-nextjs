'use client'

import { usePathname } from 'next/navigation'
import { getAffiliateUrl, getSourceFromPathname, hasAffiliateLink } from '@/lib/affiliates'

interface OrderButtonProps {
  providerId: string
  providerName: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

export function OrderButton({
  providerId,
  providerName,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: OrderButtonProps) {
  const pathname = usePathname()

  // Check if this provider has an affiliate link
  if (!hasAffiliateLink(providerId)) {
    return null
  }

  // Generate tracked URL based on current page
  const source = getSourceFromPathname(pathname)
  const orderUrl = getAffiliateUrl(providerId, source)

  if (!orderUrl) {
    return null
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  // Variant classes
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    outline: 'bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10',
  }

  return (
    <a
      href={orderUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-lg
        transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children || (
        <>
          <span>Order {providerName}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </>
      )}
    </a>
  )
}

// Simple text link version for inline use
export function OrderLink({
  providerId,
  providerName,
  className = '',
  children,
}: Omit<OrderButtonProps, 'variant' | 'size'>) {
  const pathname = usePathname()

  if (!hasAffiliateLink(providerId)) {
    return null
  }

  const source = getSourceFromPathname(pathname)
  const orderUrl = getAffiliateUrl(providerId, source)

  if (!orderUrl) {
    return null
  }

  return (
    <a
      href={orderUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors ${className}`}
    >
      {children || `Order ${providerName}`}
    </a>
  )
}
