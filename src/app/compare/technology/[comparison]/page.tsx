import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RelatedRankings } from '@/components/RelatedRankings'

interface Props {
  params: Promise<{ comparison: string }>
}

interface TechnologyInfo {
  name: string
  fullName: string
  color: string
  icon: string
  description: string
  maxSpeed: string
  typicalSpeed: string
  latency: string
  reliability: string
  availability: string
  installation: string
  priceRange: string
  bestFor: string[]
  limitations: string[]
  providers: string[]
}

const technologies: Record<string, TechnologyInfo> = {
  fiber: {
    name: 'Fiber',
    fullName: 'Fiber Optic Internet',
    color: 'from-cyan-500 to-blue-500',
    icon: '⚡',
    description: 'Fiber optic internet uses thin glass or plastic fibers to transmit data as pulses of light. It\'s the fastest and most reliable type of internet connection available.',
    maxSpeed: '10 Gbps',
    typicalSpeed: '300 Mbps - 2 Gbps',
    latency: '1-10 ms',
    reliability: 'Excellent',
    availability: 'Growing (40% of US)',
    installation: 'Professional required',
    priceRange: '$50-$180/mo',
    bestFor: ['Gaming', 'Streaming 4K/8K', 'Remote work', 'Large households', 'Content creators', 'Smart homes'],
    limitations: ['Limited availability', 'May require new installation', 'Higher upfront cost in some areas'],
    providers: ['AT&T Fiber', 'Verizon Fios', 'Google Fiber', 'Frontier Fiber', 'CenturyLink/Quantum'],
  },
  cable: {
    name: 'Cable',
    fullName: 'Cable Internet',
    color: 'from-purple-500 to-pink-500',
    icon: '📡',
    description: 'Cable internet uses the same coaxial cables that deliver cable TV. It offers fast speeds and wide availability, making it the most common type of home internet.',
    maxSpeed: '2 Gbps',
    typicalSpeed: '100 Mbps - 1 Gbps',
    latency: '10-30 ms',
    reliability: 'Good',
    availability: 'Widespread (90% of US)',
    installation: 'Self or professional',
    priceRange: '$25-$120/mo',
    bestFor: ['Most households', 'Streaming HD/4K', 'Online gaming', 'Video calls', 'Downloading'],
    limitations: ['Slower uploads', 'Shared bandwidth', 'Data caps common', 'Peak hour slowdowns'],
    providers: ['Xfinity', 'Spectrum', 'Cox', 'Optimum', 'Mediacom'],
  },
  dsl: {
    name: 'DSL',
    fullName: 'Digital Subscriber Line',
    color: 'from-green-500 to-green-600',
    icon: '📞',
    description: 'DSL uses existing telephone lines to deliver internet. While slower than cable or fiber, it\'s widely available and often the only option in rural areas.',
    maxSpeed: '100 Mbps',
    typicalSpeed: '10-50 Mbps',
    latency: '25-50 ms',
    reliability: 'Fair to Good',
    availability: 'Very Wide (85% of US)',
    installation: 'Self-install possible',
    priceRange: '$20-$60/mo',
    bestFor: ['Basic browsing', 'Email', 'Social media', 'SD streaming', 'Light use households'],
    limitations: ['Slower speeds', 'Speed depends on distance from provider', 'Being phased out'],
    providers: ['AT&T', 'CenturyLink', 'Windstream', 'Frontier', 'EarthLink'],
  },
  '5g': {
    name: '5G',
    fullName: '5G Home Internet',
    color: 'from-pink-500 to-red-500',
    icon: '📶',
    description: '5G home internet uses cellular networks to deliver broadband-like speeds without cables. It\'s a newer technology that offers an alternative to traditional wired connections.',
    maxSpeed: '1 Gbps',
    typicalSpeed: '100-300 Mbps',
    latency: '10-30 ms',
    reliability: 'Good (signal dependent)',
    availability: 'Growing (25% of US)',
    installation: 'Self-install (plug & play)',
    priceRange: '$40-$70/mo',
    bestFor: ['Renters', 'Quick setup needs', 'Areas without wired options', 'Secondary connection'],
    limitations: ['Signal dependent', 'Can be affected by weather', 'Limited to covered areas', 'May have priority data limits'],
    providers: ['T-Mobile', 'Verizon 5G Home', 'AT&T'],
  },
  satellite: {
    name: 'Satellite',
    fullName: 'Satellite Internet',
    color: 'from-gray-500 to-gray-700',
    icon: '🛰️',
    description: 'Satellite internet beams data from orbiting satellites to a dish at your home. It\'s available virtually everywhere, making it ideal for rural and remote areas.',
    maxSpeed: '500 Mbps',
    typicalSpeed: '25-150 Mbps',
    latency: '20-600 ms',
    reliability: 'Fair (weather affected)',
    availability: 'Everywhere (100%)',
    installation: 'Professional required',
    priceRange: '$50-$200/mo',
    bestFor: ['Rural areas', 'Remote locations', 'RVs/boats', 'Backup connection'],
    limitations: ['High latency', 'Weather affects service', 'Data caps common', 'Expensive equipment'],
    providers: ['Starlink', 'HughesNet', 'Viasat'],
  },
  'fixed-wireless': {
    name: 'Fixed Wireless',
    fullName: 'Fixed Wireless Internet',
    color: 'from-orange-500 to-yellow-500',
    icon: '📻',
    description: 'Fixed wireless uses radio signals from a nearby tower to deliver internet to an antenna on your home. It bridges the gap between wired and satellite in rural areas.',
    maxSpeed: '1 Gbps',
    typicalSpeed: '25-100 Mbps',
    latency: '15-50 ms',
    reliability: 'Good (line of sight)',
    availability: 'Regional (15% of US)',
    installation: 'Professional required',
    priceRange: '$40-$80/mo',
    bestFor: ['Rural areas', 'Areas without cable/fiber', 'Farms', 'Small businesses'],
    limitations: ['Requires line of sight to tower', 'Weather can affect signal', 'Limited providers'],
    providers: ['Rise Broadband', 'Starry', 'Local WISPs'],
  },
}

const comparisons: Record<string, { tech1: string; tech2: string; summary: string }> = {
  'fiber-vs-cable': {
    tech1: 'fiber',
    tech2: 'cable',
    summary: 'Fiber offers faster, more reliable speeds with symmetrical uploads, but cable is more widely available and often cheaper.',
  },
  'fiber-vs-dsl': {
    tech1: 'fiber',
    tech2: 'dsl',
    summary: 'Fiber is significantly faster and more reliable, but DSL is more widely available, especially in rural areas.',
  },
  'fiber-vs-5g': {
    tech1: 'fiber',
    tech2: '5g',
    summary: 'Fiber provides the most reliable speeds, while 5G offers flexibility and easy setup without cables.',
  },
  'cable-vs-dsl': {
    tech1: 'cable',
    tech2: 'dsl',
    summary: 'Cable is faster and more consistent, but DSL may be available in more locations.',
  },
  'cable-vs-5g': {
    tech1: 'cable',
    tech2: '5g',
    summary: 'Cable typically offers faster peak speeds, but 5G provides easy setup and no-contract flexibility.',
  },
  'cable-vs-satellite': {
    tech1: 'cable',
    tech2: 'satellite',
    summary: 'Cable is faster with lower latency, but satellite works anywhere in the country.',
  },
  '5g-vs-satellite': {
    tech1: '5g',
    tech2: 'satellite',
    summary: '5G has lower latency and is better for gaming/video calls, but satellite covers more remote areas.',
  },
  'dsl-vs-satellite': {
    tech1: 'dsl',
    tech2: 'satellite',
    summary: 'DSL has lower latency but satellite may offer faster speeds in areas far from phone company infrastructure.',
  },
  'fiber-vs-satellite': {
    tech1: 'fiber',
    tech2: 'satellite',
    summary: 'Fiber is dramatically faster with virtually no latency, but satellite is available everywhere.',
  },
  '5g-vs-fixed-wireless': {
    tech1: '5g',
    tech2: 'fixed-wireless',
    summary: 'Both are wireless options; 5G typically offers easier setup while fixed wireless may offer more consistent speeds.',
  },
}

export async function generateStaticParams() {
  return Object.keys(comparisons).map((comparison) => ({
    comparison,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { comparison } = await params
  const comparisonData = comparisons[comparison]

  if (!comparisonData) {
    return { title: 'Technology Comparison' }
  }

  const tech1 = technologies[comparisonData.tech1]
  const tech2 = technologies[comparisonData.tech2]

  return {
    title: `${tech1.name} vs ${tech2.name} Internet: Which is Better in 2025?`,
    description: `Compare ${tech1.fullName} and ${tech2.fullName}. ${comparisonData.summary} Find out which technology is right for your home.`,
  }
}

function TechStatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = (value / max) * 100
  return (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
    </div>
  )
}

function getSpeedScore(speed: string): number {
  const match = speed.match(/(\d+(?:\.\d+)?)\s*(Gbps|Mbps)/i)
  if (!match) return 0
  const value = parseFloat(match[1])
  const unit = match[2].toLowerCase()
  return unit === 'gbps' ? value * 1000 : value
}

function getLatencyScore(latency: string): number {
  const match = latency.match(/(\d+)/)
  return match ? 100 - parseInt(match[1]) : 50 // Lower is better
}

function getReliabilityScore(reliability: string): number {
  const scores: Record<string, number> = {
    'Excellent': 100,
    'Good': 75,
    'Good (signal dependent)': 65,
    'Good (line of sight)': 65,
    'Fair to Good': 50,
    'Fair (weather affected)': 40,
  }
  return scores[reliability] || 50
}

export default async function TechnologyComparisonPage({ params }: Props) {
  const { comparison } = await params
  const comparisonData = comparisons[comparison]

  if (!comparisonData) {
    notFound()
  }

  const tech1 = technologies[comparisonData.tech1]
  const tech2 = technologies[comparisonData.tech2]

  // Calculate scores for comparison
  const speed1 = getSpeedScore(tech1.maxSpeed)
  const speed2 = getSpeedScore(tech2.maxSpeed)
  const maxSpeed = Math.max(speed1, speed2)

  const latency1 = getLatencyScore(tech1.latency)
  const latency2 = getLatencyScore(tech2.latency)

  const reliability1 = getReliabilityScore(tech1.reliability)
  const reliability2 = getReliabilityScore(tech2.reliability)

  // Related comparisons
  const relatedComparisons = Object.entries(comparisons)
    .filter(([key]) =>
      key !== comparison &&
      (key.includes(comparisonData.tech1) || key.includes(comparisonData.tech2))
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
          <span className="text-white">{tech1.name} vs {tech2.name}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium mb-4">
            Technology Comparison
          </span>
          <h1 className="text-4xl font-bold mb-4">
            {tech1.name} vs {tech2.name} Internet
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {comparisonData.summary}
          </p>
        </div>

        {/* Technology Headers */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`bg-gradient-to-br ${tech1.color} rounded-xl p-6 text-center`}>
            <div className="text-4xl mb-3">{tech1.icon}</div>
            <h2 className="text-2xl font-bold mb-1">{tech1.fullName}</h2>
            <p className="text-white/80 text-sm">Max Speed: {tech1.maxSpeed}</p>
          </div>
          <div className={`bg-gradient-to-br ${tech2.color} rounded-xl p-6 text-center`}>
            <div className="text-4xl mb-3">{tech2.icon}</div>
            <h2 className="text-2xl font-bold mb-1">{tech2.fullName}</h2>
            <p className="text-white/80 text-sm">Max Speed: {tech2.maxSpeed}</p>
          </div>
        </div>

        {/* Visual Comparison Bars */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-6 text-center">Performance Comparison</h3>

          {/* Speed */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Max Speed</span>
              <span className="text-gray-400">{tech1.maxSpeed} vs {tech2.maxSpeed}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <TechStatBar value={speed1} max={maxSpeed} color="bg-cyan-500" />
                <span className="text-xs text-gray-500 mt-1 block">{tech1.name}</span>
              </div>
              <div>
                <TechStatBar value={speed2} max={maxSpeed} color="bg-purple-500" />
                <span className="text-xs text-gray-500 mt-1 block">{tech2.name}</span>
              </div>
            </div>
          </div>

          {/* Latency */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Latency (Lower is Better)</span>
              <span className="text-gray-400">{tech1.latency} vs {tech2.latency}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <TechStatBar value={latency1} max={100} color="bg-cyan-500" />
                <span className="text-xs text-gray-500 mt-1 block">{tech1.name}</span>
              </div>
              <div>
                <TechStatBar value={latency2} max={100} color="bg-purple-500" />
                <span className="text-xs text-gray-500 mt-1 block">{tech2.name}</span>
              </div>
            </div>
          </div>

          {/* Reliability */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Reliability</span>
              <span className="text-gray-400">{tech1.reliability} vs {tech2.reliability}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <TechStatBar value={reliability1} max={100} color="bg-cyan-500" />
                <span className="text-xs text-gray-500 mt-1 block">{tech1.name}</span>
              </div>
              <div>
                <TechStatBar value={reliability2} max={100} color="bg-purple-500" />
                <span className="text-xs text-gray-500 mt-1 block">{tech2.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800/50 font-semibold">
            <div>Specification</div>
            <div className="text-center">{tech1.name}</div>
            <div className="text-center">{tech2.name}</div>
          </div>

          {[
            { label: 'Max Speed', key: 'maxSpeed' },
            { label: 'Typical Speed', key: 'typicalSpeed' },
            { label: 'Latency', key: 'latency' },
            { label: 'Reliability', key: 'reliability' },
            { label: 'Availability', key: 'availability' },
            { label: 'Installation', key: 'installation' },
            { label: 'Price Range', key: 'priceRange' },
          ].map((row, index) => (
            <div
              key={row.key}
              className={`grid grid-cols-3 gap-4 p-4 border-t border-gray-800 ${index % 2 === 0 ? 'bg-gray-800/20' : ''}`}
            >
              <div className="font-medium">{row.label}</div>
              <div className="text-center text-gray-300">{tech1[row.key as keyof TechnologyInfo] as string}</div>
              <div className="text-center text-gray-300">{tech2[row.key as keyof TechnologyInfo] as string}</div>
            </div>
          ))}
        </div>

        {/* Best For / Limitations */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">{tech1.icon} {tech1.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{tech1.description}</p>

            <h4 className="text-green-400 font-medium mb-2">Best For:</h4>
            <ul className="text-sm text-gray-400 space-y-1 mb-4">
              {tech1.bestFor.map((item, i) => (
                <li key={i}>✓ {item}</li>
              ))}
            </ul>

            <h4 className="text-yellow-400 font-medium mb-2">Limitations:</h4>
            <ul className="text-sm text-gray-400 space-y-1 mb-4">
              {tech1.limitations.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>

            <h4 className="text-blue-400 font-medium mb-2">Top Providers:</h4>
            <div className="flex flex-wrap gap-2">
              {tech1.providers.map((provider, i) => (
                <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs">{provider}</span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">{tech2.icon} {tech2.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{tech2.description}</p>

            <h4 className="text-green-400 font-medium mb-2">Best For:</h4>
            <ul className="text-sm text-gray-400 space-y-1 mb-4">
              {tech2.bestFor.map((item, i) => (
                <li key={i}>✓ {item}</li>
              ))}
            </ul>

            <h4 className="text-yellow-400 font-medium mb-2">Limitations:</h4>
            <ul className="text-sm text-gray-400 space-y-1 mb-4">
              {tech2.limitations.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>

            <h4 className="text-blue-400 font-medium mb-2">Top Providers:</h4>
            <div className="flex flex-wrap gap-2">
              {tech2.providers.map((provider, i) => (
                <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs">{provider}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-800/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Which Should You Choose?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-cyan-400 mb-2">Choose {tech1.name} if:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                {speed1 > speed2 && <li>• You need the fastest possible speeds</li>}
                {latency1 > latency2 && <li>• Low latency is important (gaming, video calls)</li>}
                {reliability1 > reliability2 && <li>• You need the most reliable connection</li>}
                {tech1.name === 'Fiber' && <li>• You want symmetrical upload/download speeds</li>}
                {tech1.name === 'Cable' && <li>• You want wide availability at reasonable prices</li>}
                {tech1.name === 'DSL' && <li>• You need basic internet at a low cost</li>}
                {tech1.name === '5G' && <li>• You want easy setup without cables</li>}
                {tech1.name === 'Satellite' && <li>• You live in a rural/remote area</li>}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-purple-400 mb-2">Choose {tech2.name} if:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                {speed2 > speed1 && <li>• You need the fastest possible speeds</li>}
                {latency2 > latency1 && <li>• Low latency is important (gaming, video calls)</li>}
                {reliability2 > reliability1 && <li>• You need the most reliable connection</li>}
                {tech2.name === 'Fiber' && <li>• You want symmetrical upload/download speeds</li>}
                {tech2.name === 'Cable' && <li>• You want wide availability at reasonable prices</li>}
                {tech2.name === 'DSL' && <li>• You need basic internet at a low cost</li>}
                {tech2.name === '5G' && <li>• You want easy setup without cables</li>}
                {tech2.name === 'Satellite' && <li>• You live in a rural/remote area</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Related Comparisons */}
        {relatedComparisons.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Related Technology Comparisons</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {relatedComparisons.map(([key, data]) => (
                <Link
                  key={key}
                  href={`/compare/technology/${key}`}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <span className="font-medium">
                    {technologies[data.tech1].name} vs {technologies[data.tech2].name}
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
        <RelatedRankings title="Find Providers by Technology" />

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-cyan-900/50 to-purple-900/50 rounded-xl p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Find {tech1.name} & {tech2.name} Providers Near You</h2>
          <p className="text-gray-400 mb-6">
            Enter your ZIP code to see which technologies are available at your address
          </p>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Check Availability
          </Link>
        </div>
      </div>
    </div>
  )
}
