import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RelatedRankings } from '@/components/RelatedRankings'
import { ProviderLogo } from '@/components/ProviderLogo'

interface Props {
  params: Promise<{ comparison: string }>
}

// Provider details for comparison (supplementary info not in DB)
// Keys must match database slugs exactly
const providerDetails: Record<string, {
  color: string
  tagline: string
  founded: string
  headquarters: string
  maxSpeed: string
  minPrice: string
  contractRequired: boolean
  dataCap: string
  primaryTech: string
}> = {
  'att-internet': {
    color: 'from-blue-500 to-cyan-500',
    tagline: 'America\'s largest fiber network',
    founded: '1983',
    headquarters: 'Dallas, TX',
    maxSpeed: '5 Gbps',
    minPrice: '$55/mo',
    contractRequired: false,
    dataCap: 'None (fiber)',
    primaryTech: 'Fiber',
  },
  'xfinity': {
    color: 'from-purple-500 to-pink-500',
    tagline: 'Fastest cable internet provider',
    founded: '1963',
    headquarters: 'Philadelphia, PA',
    maxSpeed: '2 Gbps',
    minPrice: '$25/mo',
    contractRequired: false,
    dataCap: '1.2 TB',
    primaryTech: 'Cable',
  },
  'spectrum': {
    color: 'from-blue-600 to-blue-400',
    tagline: 'No contracts, no data caps',
    founded: '2014',
    headquarters: 'Stamford, CT',
    maxSpeed: '1 Gbps',
    minPrice: '$30/mo',
    contractRequired: false,
    dataCap: 'None',
    primaryTech: 'Cable',
  },
  'verizon-fios': {
    color: 'from-red-500 to-red-600',
    tagline: 'Premium fiber experience',
    founded: '2000',
    headquarters: 'New York, NY',
    maxSpeed: '2.3 Gbps',
    minPrice: '$35/mo',
    contractRequired: false,
    dataCap: 'None',
    primaryTech: 'Fiber',
  },
  'frontier-fiber': {
    color: 'from-red-600 to-red-400',
    tagline: 'Fiber for life pricing',
    founded: '1935',
    headquarters: 'Dallas, TX',
    maxSpeed: '5 Gbps',
    minPrice: '$50/mo',
    contractRequired: false,
    dataCap: 'None',
    primaryTech: 'Fiber',
  },
  'cox': {
    color: 'from-orange-500 to-orange-600',
    tagline: 'Regional cable leader',
    founded: '1962',
    headquarters: 'Atlanta, GA',
    maxSpeed: '2 Gbps',
    minPrice: '$50/mo',
    contractRequired: true,
    dataCap: '1.25 TB',
    primaryTech: 'Cable',
  },
  't-mobile': {
    color: 'from-pink-500 to-pink-600',
    tagline: '5G home internet pioneer',
    founded: '1994',
    headquarters: 'Bellevue, WA',
    maxSpeed: '245 Mbps',
    minPrice: '$40/mo',
    contractRequired: false,
    dataCap: 'None',
    primaryTech: '5G',
  },
  'google-fiber': {
    color: 'from-red-500 to-yellow-500',
    tagline: 'The original gigabit provider',
    founded: '2010',
    headquarters: 'Mountain View, CA',
    maxSpeed: '8 Gbps',
    minPrice: '$70/mo',
    contractRequired: false,
    dataCap: 'None',
    primaryTech: 'Fiber',
  },
  'centurylink': {
    color: 'from-green-500 to-green-600',
    tagline: 'Fiber expanding nationwide',
    founded: '1930',
    headquarters: 'Monroe, LA',
    maxSpeed: '940 Mbps',
    minPrice: '$30/mo',
    contractRequired: false,
    dataCap: 'None (fiber)',
    primaryTech: 'Fiber/DSL',
  },
  'astound-broadband': {
    color: 'from-blue-500 to-blue-600',
    tagline: 'Regional cable and fiber provider',
    founded: '1973',
    headquarters: 'Princeton, NJ',
    maxSpeed: '1 Gbps',
    minPrice: '$40/mo',
    contractRequired: false,
    dataCap: 'None',
    primaryTech: 'Cable',
  },
  'hughesnet': {
    color: 'from-blue-600 to-blue-700',
    tagline: 'Satellite internet everywhere',
    founded: '1971',
    headquarters: 'Germantown, MD',
    maxSpeed: '100 Mbps',
    minPrice: '$50/mo',
    contractRequired: true,
    dataCap: '100 GB',
    primaryTech: 'Satellite',
  },
  'viasat': {
    color: 'from-gray-700 to-gray-800',
    tagline: 'High-speed satellite internet',
    founded: '1986',
    headquarters: 'Carlsbad, CA',
    maxSpeed: '150 Mbps',
    minPrice: '$70/mo',
    contractRequired: true,
    dataCap: 'Varies by plan',
    primaryTech: 'Satellite',
  },
}

// Popular comparison pairs for static generation
// Slugs must match database exactly
const popularComparisons = [
  ['att-internet', 'xfinity'],
  ['att-internet', 'spectrum'],
  ['att-internet', 'verizon-fios'],
  ['xfinity', 'spectrum'],
  ['xfinity', 'verizon-fios'],
  ['spectrum', 'verizon-fios'],
  ['frontier-fiber', 'att-internet'],
  ['frontier-fiber', 'verizon-fios'],
  ['cox', 'att-internet'],
  ['cox', 'spectrum'],
  ['t-mobile', 'xfinity'],
  ['t-mobile', 'spectrum'],
  ['google-fiber', 'att-internet'],
  ['google-fiber', 'verizon-fios'],
  ['viasat', 'hughesnet'],
  ['centurylink', 'att-internet'],
]

async function getProvider(slug: string) {
  const supabase = createAdminClient()

  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!provider) return null

  // Get coverage count
  const { count } = await supabase
    .from('coverage')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', provider.id)

  return { ...provider, coverageCount: count || 0 }
}

function parseComparison(comparison: string): [string, string] | null {
  const match = comparison.match(/^(.+)-vs-(.+)$/)
  if (!match) return null
  return [match[1], match[2]]
}

export async function generateStaticParams() {
  return popularComparisons.map(([p1, p2]) => ({
    comparison: `${p1}-vs-${p2}`,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { comparison } = await params
  const parsed = parseComparison(comparison)

  if (!parsed) {
    return { title: 'Provider Comparison' }
  }

  const [slug1, slug2] = parsed
  const [provider1, provider2] = await Promise.all([
    getProvider(slug1),
    getProvider(slug2),
  ])

  if (!provider1 || !provider2) {
    return { title: 'Provider Comparison' }
  }

  return {
    title: `${provider1.name} vs ${provider2.name}: Which Internet Provider is Better?`,
    description: `Compare ${provider1.name} and ${provider2.name} internet plans, speeds, pricing, and coverage. Find out which provider is right for you.`,
  }
}

function ComparisonBadge({ winner, label }: { winner: 1 | 2 | 'tie', label: string }) {
  if (winner === 'tie') {
    return (
      <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-medium">
        Tie
      </span>
    )
  }
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      winner === 1 ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
    }`}>
      {label} Wins
    </span>
  )
}

function parseSpeed(speed: string): number {
  const match = speed.match(/(\d+(?:\.\d+)?)\s*(Gbps|Mbps)/i)
  if (!match) return 0
  const value = parseFloat(match[1])
  const unit = match[2].toLowerCase()
  return unit === 'gbps' ? value * 1000 : value
}

function parsePrice(price: string): number {
  const match = price.match(/\$(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : 999
}

export default async function ProviderComparisonPage({ params }: Props) {
  const { comparison } = await params
  const parsed = parseComparison(comparison)

  if (!parsed) {
    notFound()
  }

  const [slug1, slug2] = parsed
  const [provider1, provider2] = await Promise.all([
    getProvider(slug1),
    getProvider(slug2),
  ])

  if (!provider1 || !provider2) {
    notFound()
  }

  const details1 = providerDetails[slug1] || {
    color: 'from-gray-500 to-gray-600',
    tagline: 'Internet service provider',
    founded: 'N/A',
    headquarters: 'N/A',
    maxSpeed: 'Varies',
    minPrice: 'Contact for pricing',
    contractRequired: false,
    dataCap: 'Varies',
    primaryTech: 'Various',
  }
  const details2 = providerDetails[slug2] || {
    color: 'from-gray-500 to-gray-600',
    tagline: 'Internet service provider',
    founded: 'N/A',
    headquarters: 'N/A',
    maxSpeed: 'Varies',
    minPrice: 'Contact for pricing',
    contractRequired: false,
    dataCap: 'Varies',
    primaryTech: 'Various',
  }

  // Determine winners for each category
  const speed1 = parseSpeed(details1.maxSpeed)
  const speed2 = parseSpeed(details2.maxSpeed)
  const speedWinner: 1 | 2 | 'tie' = speed1 > speed2 ? 1 : speed2 > speed1 ? 2 : 'tie'

  const price1 = parsePrice(details1.minPrice)
  const price2 = parsePrice(details2.minPrice)
  const priceWinner: 1 | 2 | 'tie' = price1 < price2 ? 1 : price2 < price1 ? 2 : 'tie'

  const coverage1 = provider1.coverageCount
  const coverage2 = provider2.coverageCount
  const coverageWinner: 1 | 2 | 'tie' = coverage1 > coverage2 ? 1 : coverage2 > coverage1 ? 2 : 'tie'

  // Overall winner (simple scoring)
  let score1 = 0
  let score2 = 0
  if (speedWinner === 1) score1++
  if (speedWinner === 2) score2++
  if (priceWinner === 1) score1++
  if (priceWinner === 2) score2++
  if (coverageWinner === 1) score1++
  if (coverageWinner === 2) score2++
  if (!details1.contractRequired) score1++
  if (!details2.contractRequired) score2++
  if (details1.dataCap === 'None' || details1.dataCap === 'None (fiber)') score1++
  if (details2.dataCap === 'None' || details2.dataCap === 'None (fiber)') score2++

  const overallWinner = score1 > score2 ? provider1.name : score2 > score1 ? provider2.name : 'Tie'

  // Other popular comparisons for this provider
  const relatedComparisons = popularComparisons
    .filter(([p1, p2]) =>
      (p1 === slug1 || p2 === slug1 || p1 === slug2 || p2 === slug2) &&
      !(p1 === slug1 && p2 === slug2) &&
      !(p1 === slug2 && p2 === slug1)
    )
    .slice(0, 4)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/compare" className="hover:text-white">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{provider1.name} vs {provider2.name}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            Provider Comparison
          </span>
          <h1 className="text-4xl font-bold mb-4">
            {provider1.name} vs {provider2.name}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Compare speeds, pricing, coverage, and features to find the best provider for your needs.
          </p>
        </div>

        {/* Provider Headers */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`bg-gradient-to-br ${details1.color} rounded-xl p-6 text-center`}>
            <div className="mx-auto mb-4">
              <ProviderLogo slug={slug1} name={provider1.name} size="xl" />
            </div>
            <h2 className="text-2xl font-bold mb-1">{provider1.name}</h2>
            <p className="text-white/80 text-sm">{details1.tagline}</p>
          </div>
          <div className={`bg-gradient-to-br ${details2.color} rounded-xl p-6 text-center`}>
            <div className="mx-auto mb-4">
              <ProviderLogo slug={slug2} name={provider2.name} size="xl" />
            </div>
            <h2 className="text-2xl font-bold mb-1">{provider2.name}</h2>
            <p className="text-white/80 text-sm">{details2.tagline}</p>
          </div>
        </div>

        {/* Quick Verdict */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Quick Verdict</h3>
          <p className="text-2xl font-bold text-blue-400 mb-2">
            {overallWinner === 'Tie' ? "It's a tie!" : `${overallWinner} wins overall`}
          </p>
          <p className="text-gray-400 text-sm">
            Based on speed, price, coverage, contracts, and data caps
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-800/50 font-semibold">
            <div>Feature</div>
            <div className="text-center">{provider1.name}</div>
            <div className="text-center">{provider2.name}</div>
            <div className="text-center">Winner</div>
          </div>

          {/* Max Speed */}
          <div className="grid grid-cols-4 gap-4 p-4 border-t border-gray-800 items-center">
            <div className="font-medium">Max Speed</div>
            <div className="text-center">
              <span className="text-xl font-bold text-cyan-400">{details1.maxSpeed}</span>
            </div>
            <div className="text-center">
              <span className="text-xl font-bold text-cyan-400">{details2.maxSpeed}</span>
            </div>
            <div className="text-center">
              <ComparisonBadge winner={speedWinner} label={speedWinner === 1 ? provider1.name : provider2.name} />
            </div>
          </div>

          {/* Starting Price */}
          <div className="grid grid-cols-4 gap-4 p-4 border-t border-gray-800 items-center bg-gray-800/20">
            <div className="font-medium">Starting Price</div>
            <div className="text-center">
              <span className="text-xl font-bold text-green-400">{details1.minPrice}</span>
            </div>
            <div className="text-center">
              <span className="text-xl font-bold text-green-400">{details2.minPrice}</span>
            </div>
            <div className="text-center">
              <ComparisonBadge winner={priceWinner} label={priceWinner === 1 ? provider1.name : provider2.name} />
            </div>
          </div>

          {/* Coverage */}
          <div className="grid grid-cols-4 gap-4 p-4 border-t border-gray-800 items-center">
            <div className="font-medium">Coverage (ZIP Codes)</div>
            <div className="text-center">
              <span className="text-xl font-bold text-purple-400">{coverage1.toLocaleString()}</span>
            </div>
            <div className="text-center">
              <span className="text-xl font-bold text-purple-400">{coverage2.toLocaleString()}</span>
            </div>
            <div className="text-center">
              <ComparisonBadge winner={coverageWinner} label={coverageWinner === 1 ? provider1.name : provider2.name} />
            </div>
          </div>

          {/* Technology */}
          <div className="grid grid-cols-4 gap-4 p-4 border-t border-gray-800 items-center bg-gray-800/20">
            <div className="font-medium">Primary Technology</div>
            <div className="text-center">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">{details1.primaryTech}</span>
            </div>
            <div className="text-center">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">{details2.primaryTech}</span>
            </div>
            <div className="text-center text-gray-500 text-sm">Depends on needs</div>
          </div>

          {/* Contract */}
          <div className="grid grid-cols-4 gap-4 p-4 border-t border-gray-800 items-center">
            <div className="font-medium">Contract Required</div>
            <div className="text-center">
              {details1.contractRequired ? (
                <span className="text-red-400">Yes</span>
              ) : (
                <span className="text-green-400">No</span>
              )}
            </div>
            <div className="text-center">
              {details2.contractRequired ? (
                <span className="text-red-400">Yes</span>
              ) : (
                <span className="text-green-400">No</span>
              )}
            </div>
            <div className="text-center">
              {!details1.contractRequired && details2.contractRequired && (
                <ComparisonBadge winner={1} label={provider1.name} />
              )}
              {details1.contractRequired && !details2.contractRequired && (
                <ComparisonBadge winner={2} label={provider2.name} />
              )}
              {details1.contractRequired === details2.contractRequired && (
                <ComparisonBadge winner="tie" label="" />
              )}
            </div>
          </div>

          {/* Data Cap */}
          <div className="grid grid-cols-4 gap-4 p-4 border-t border-gray-800 items-center bg-gray-800/20">
            <div className="font-medium">Data Cap</div>
            <div className="text-center">
              <span className={details1.dataCap === 'None' || details1.dataCap === 'None (fiber)' ? 'text-green-400' : 'text-yellow-400'}>
                {details1.dataCap}
              </span>
            </div>
            <div className="text-center">
              <span className={details2.dataCap === 'None' || details2.dataCap === 'None (fiber)' ? 'text-green-400' : 'text-yellow-400'}>
                {details2.dataCap}
              </span>
            </div>
            <div className="text-center">
              {(details1.dataCap === 'None' || details1.dataCap === 'None (fiber)') &&
               !(details2.dataCap === 'None' || details2.dataCap === 'None (fiber)') && (
                <ComparisonBadge winner={1} label={provider1.name} />
              )}
              {!(details1.dataCap === 'None' || details1.dataCap === 'None (fiber)') &&
               (details2.dataCap === 'None' || details2.dataCap === 'None (fiber)') && (
                <ComparisonBadge winner={2} label={provider2.name} />
              )}
              {((details1.dataCap === 'None' || details1.dataCap === 'None (fiber)') ===
                (details2.dataCap === 'None' || details2.dataCap === 'None (fiber)')) && (
                <ComparisonBadge winner="tie" label="" />
              )}
            </div>
          </div>
        </div>

        {/* Pros and Cons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">
              <Link href={`/providers/${slug1}`} className="hover:text-blue-400 transition-colors">
                {provider1.name}
              </Link> Pros & Cons
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-green-400 font-medium mb-2">Pros</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  {speedWinner === 1 && <li>✓ Faster max speeds ({details1.maxSpeed})</li>}
                  {priceWinner === 1 && <li>✓ Lower starting price ({details1.minPrice})</li>}
                  {coverageWinner === 1 && <li>✓ Wider coverage ({coverage1.toLocaleString()} ZIP codes)</li>}
                  {!details1.contractRequired && <li>✓ No contract required</li>}
                  {(details1.dataCap === 'None' || details1.dataCap === 'None (fiber)') && <li>✓ No data caps</li>}
                  {details1.primaryTech === 'Fiber' && <li>✓ Fiber technology (fastest, most reliable)</li>}
                </ul>
              </div>
              <div>
                <h4 className="text-red-400 font-medium mb-2">Cons</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  {speedWinner === 2 && <li>✗ Slower than {provider2.name}</li>}
                  {priceWinner === 2 && <li>✗ More expensive starting price</li>}
                  {coverageWinner === 2 && <li>✗ Less coverage than {provider2.name}</li>}
                  {details1.contractRequired && <li>✗ Contract required</li>}
                  {details1.dataCap !== 'None' && details1.dataCap !== 'None (fiber)' && <li>✗ Has data cap ({details1.dataCap})</li>}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">
              <Link href={`/providers/${slug2}`} className="hover:text-blue-400 transition-colors">
                {provider2.name}
              </Link> Pros & Cons
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-green-400 font-medium mb-2">Pros</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  {speedWinner === 2 && <li>✓ Faster max speeds ({details2.maxSpeed})</li>}
                  {priceWinner === 2 && <li>✓ Lower starting price ({details2.minPrice})</li>}
                  {coverageWinner === 2 && <li>✓ Wider coverage ({coverage2.toLocaleString()} ZIP codes)</li>}
                  {!details2.contractRequired && <li>✓ No contract required</li>}
                  {(details2.dataCap === 'None' || details2.dataCap === 'None (fiber)') && <li>✓ No data caps</li>}
                  {details2.primaryTech === 'Fiber' && <li>✓ Fiber technology (fastest, most reliable)</li>}
                </ul>
              </div>
              <div>
                <h4 className="text-red-400 font-medium mb-2">Cons</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  {speedWinner === 1 && <li>✗ Slower than {provider1.name}</li>}
                  {priceWinner === 1 && <li>✗ More expensive starting price</li>}
                  {coverageWinner === 1 && <li>✗ Less coverage than {provider1.name}</li>}
                  {details2.contractRequired && <li>✗ Contract required</li>}
                  {details2.dataCap !== 'None' && details2.dataCap !== 'None (fiber)' && <li>✗ Has data cap ({details2.dataCap})</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* When to Choose Each */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Which Provider Should You Choose?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-blue-400 mb-2">Choose {provider1.name} if:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                {speedWinner === 1 && <li>• You need the fastest speeds available</li>}
                {priceWinner === 1 && <li>• You want the lowest starting price</li>}
                {details1.primaryTech === 'Fiber' && <li>• You want fiber reliability and low latency</li>}
                {details1.primaryTech === '5G' && <li>• You want wireless flexibility without cables</li>}
                {!details1.contractRequired && details2.contractRequired && <li>• You don&apos;t want to commit to a contract</li>}
                <li>• {provider1.name} is available at your address</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-purple-400 mb-2">Choose {provider2.name} if:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                {speedWinner === 2 && <li>• You need the fastest speeds available</li>}
                {priceWinner === 2 && <li>• You want the lowest starting price</li>}
                {details2.primaryTech === 'Fiber' && <li>• You want fiber reliability and low latency</li>}
                {details2.primaryTech === '5G' && <li>• You want wireless flexibility without cables</li>}
                {!details2.contractRequired && details1.contractRequired && <li>• You don&apos;t want to commit to a contract</li>}
                <li>• {provider2.name} is available at your address</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Comparisons */}
        {relatedComparisons.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Related Comparisons</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {relatedComparisons.map(([p1, p2]) => (
                <Link
                  key={`${p1}-${p2}`}
                  href={`/compare/${p1}-vs-${p2}`}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <span className="font-medium">
                    {p1.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} vs{' '}
                    {p2.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Rankings */}
        <RelatedRankings title="Explore Internet Rankings" />

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Check Availability at Your Address</h2>
          <p className="text-gray-400 mb-6">
            Enter your ZIP code to see if {provider1.name} or {provider2.name} is available
          </p>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Compare Providers in Your Area
          </Link>
        </div>
      </div>
    </div>
  )
}
