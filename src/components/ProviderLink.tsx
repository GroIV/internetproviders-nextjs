import Link from 'next/link'
import { getProviderSlug, cleanProviderName } from '@/lib/providers'

interface ProviderLinkProps {
  name: string
  className?: string
  showArrow?: boolean
}

/**
 * Renders a provider name as a link to their detail page if we have one,
 * otherwise just renders the cleaned name as text.
 */
export function ProviderLink({ name, className = '', showArrow = false }: ProviderLinkProps) {
  const slug = getProviderSlug(name)
  const displayName = cleanProviderName(name)

  if (slug) {
    return (
      <Link
        href={`/providers/${slug}`}
        className={`hover:text-blue-400 transition-colors ${className}`}
      >
        {displayName}
        {showArrow && (
          <svg className="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </Link>
    )
  }

  return <span className={className}>{displayName}</span>
}

/**
 * Renders a provider card/badge with link
 */
export function ProviderCard({
  name,
  coverage,
  type,
  typeColor = 'text-gray-400'
}: {
  name: string
  coverage?: number
  type?: string
  typeColor?: string
}) {
  const slug = getProviderSlug(name)
  const displayName = cleanProviderName(name)

  const content = (
    <div className="flex justify-between items-center">
      <div>
        <span className="text-gray-300 group-hover:text-blue-400 transition-colors">
          {displayName}
        </span>
        {type && (
          <span className={`text-xs ml-2 ${typeColor}`}>({type})</span>
        )}
      </div>
      {coverage !== undefined && (
        <span className="text-sm text-gray-500">{coverage}%</span>
      )}
    </div>
  )

  if (slug) {
    return (
      <Link
        href={`/providers/${slug}`}
        className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="p-3 bg-gray-800/50 rounded-lg">
      {content}
    </div>
  )
}
