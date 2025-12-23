import Link from 'next/link'

interface RankingLink {
  href: string
  label: string
  icon: React.ReactNode
  description: string
}

const defaultRankings: RankingLink[] = [
  {
    href: '/best/fiber-providers',
    label: 'Best Fiber Providers',
    description: 'Fastest fiber internet options',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    href: '/best/cable-providers',
    label: 'Best Cable Providers',
    description: 'Top-rated cable internet ISPs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/cheapest/providers',
    label: 'Cheapest Internet',
    description: 'Most affordable plans',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/fastest/providers',
    label: 'Fastest Providers',
    description: 'Highest speed available',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    href: '/deals',
    label: 'Current Deals',
    description: 'Latest promotions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
]

interface RelatedRankingsProps {
  title?: string
  rankings?: RankingLink[]
  columns?: 2 | 4 | 5
}

export function RelatedRankings({
  title = 'Explore Rankings',
  rankings = defaultRankings,
  columns = 5
}: RelatedRankingsProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className={`grid ${columns === 5 ? 'md:grid-cols-5' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-2'} gap-4`}>
        {rankings.map((ranking) => (
          <Link
            key={ranking.href}
            href={ranking.href}
            className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
              {ranking.icon}
            </div>
            <div>
              <div className="font-medium text-sm group-hover:text-blue-400 transition-colors">
                {ranking.label}
              </div>
              <div className="text-xs text-gray-500">{ranking.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Compact version for sidebars
export function RelatedRankingsCompact() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="font-semibold mb-3 text-sm text-gray-400 uppercase tracking-wide">Rankings</h3>
      <ul className="space-y-2">
        {defaultRankings.map((ranking) => (
          <li key={ranking.href}>
            <Link
              href={ranking.href}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400 transition-colors"
            >
              <span className="text-blue-400">{ranking.icon}</span>
              {ranking.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
