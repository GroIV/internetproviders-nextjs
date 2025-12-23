import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ zip?: string }>
}

const guideTemplates: Record<string, {
  id: string
  category: string
  title: (city: string) => string
  description: (city: string) => string
  icon: string
  color: string
  content: (city: string, zipCode: string) => string
  filterProviders?: (providers: Provider[]) => Provider[]
}> = {
  'best-internet-providers': {
    id: 'best-internet-providers',
    category: 'Comparison',
    title: (city) => `Best Internet Providers in ${city}`,
    description: (city) => `Compare the top-rated internet providers available in ${city}. Find the best coverage, speeds, and prices.`,
    icon: '🏆',
    color: 'text-blue-400',
    content: (city, zipCode) => `
      <h2>Top Internet Providers in ${city}</h2>
      <p>Finding the best internet provider depends on your specific needs: speed requirements, budget, and what's available at your address. Here's how to evaluate your options:</p>

      <h3>What Makes a Provider "Best"?</h3>
      <ul>
        <li><strong>Availability:</strong> The best provider is one that actually services your address</li>
        <li><strong>Speed:</strong> Match your household's needs (streaming, gaming, work from home)</li>
        <li><strong>Reliability:</strong> Uptime and consistent performance matter more than peak speeds</li>
        <li><strong>Price:</strong> Consider total cost including equipment rental and fees</li>
        <li><strong>Customer Service:</strong> Important when things go wrong</li>
      </ul>

      <h3>Provider Types Ranked</h3>
      <ol>
        <li><strong>Fiber:</strong> Best overall - fastest, most reliable, symmetrical speeds</li>
        <li><strong>Cable:</strong> Widely available with good speeds, but shared bandwidth</li>
        <li><strong>5G Home:</strong> Good alternative where available, no wired installation needed</li>
        <li><strong>DSL:</strong> Older technology, slower speeds but sometimes only option</li>
        <li><strong>Satellite:</strong> Available everywhere but high latency, data caps</li>
      </ol>

      <h3>How to Choose</h3>
      <p>Start by checking which providers service your exact address. Then compare:</p>
      <ul>
        <li>Promotional vs regular pricing</li>
        <li>Contract requirements and early termination fees</li>
        <li>Data caps and overage charges</li>
        <li>Equipment rental costs vs buying your own</li>
        <li>Installation fees and scheduling</li>
      </ul>

      <h3>Red Flags to Avoid</h3>
      <ul>
        <li>Prices that jump significantly after promotional period</li>
        <li>Strict data caps with expensive overages</li>
        <li>Long-term contracts with high cancellation fees</li>
        <li>Required equipment rental at high monthly costs</li>
      </ul>
    `,
  },
  gaming: {
    id: 'gaming',
    category: 'Gaming',
    title: (city) => `Best Gaming Internet in ${city}`,
    description: (city) => `Find the best internet for gaming in ${city}. Low latency and fast speeds for competitive gaming.`,
    icon: '🎮',
    color: 'text-purple-400',
    content: (city, zipCode) => `
      <h2>What Makes Great Gaming Internet?</h2>
      <p>For online gaming in ${city}, you need more than just fast download speeds. The key factors are:</p>
      <ul>
        <li><strong>Low Latency (Ping):</strong> Under 20ms is ideal for competitive gaming. Fiber and cable typically offer 10-30ms.</li>
        <li><strong>Stable Connection:</strong> Consistent speeds without drops are crucial during matches.</li>
        <li><strong>Upload Speed:</strong> At least 5 Mbps for streaming your gameplay, more for 4K streaming.</li>
      </ul>
      <h2>Recommended Speeds for Gaming</h2>
      <ul>
        <li><strong>Casual Gaming:</strong> 25-50 Mbps is sufficient for most online games</li>
        <li><strong>Competitive Gaming:</strong> 100+ Mbps recommended for minimal lag</li>
        <li><strong>Streaming While Gaming:</strong> 200+ Mbps for 1080p, 300+ Mbps for 4K</li>
      </ul>
      <h2>Best Connection Types for Gaming</h2>
      <ol>
        <li><strong>Fiber:</strong> Best option - lowest latency, symmetrical speeds</li>
        <li><strong>Cable:</strong> Good option - fast speeds, low latency in most areas</li>
        <li><strong>5G Home:</strong> Decent option - improving but can have variable latency</li>
        <li><strong>Satellite:</strong> Not recommended - high latency (400-600ms+)</li>
      </ol>
    `,
    filterProviders: (providers) => providers.filter(p =>
      p.technologies?.some(t => ['Fiber', 'Cable', '5G'].includes(t))
    ),
  },
  budget: {
    id: 'budget',
    category: 'Budget-Friendly',
    title: (city) => `Cheapest Internet Options in ${city}`,
    description: (city) => `Find affordable internet in ${city}. Compare low-cost plans and money-saving tips.`,
    icon: '💰',
    color: 'text-green-400',
    content: (city, zipCode) => `
      <h2>How to Save on Internet in ${city}</h2>
      <p>Getting affordable internet doesn't mean sacrificing quality. Here's how to find the best deals:</p>
      <h3>1. Choose the Right Speed</h3>
      <p>Don't overpay for speeds you won't use:</p>
      <ul>
        <li><strong>1-2 people, basic use:</strong> 50-100 Mbps ($25-40/mo)</li>
        <li><strong>3-4 people, moderate use:</strong> 100-200 Mbps ($40-60/mo)</li>
        <li><strong>5+ people, heavy use:</strong> 300+ Mbps ($50-80/mo)</li>
      </ul>
      <h3>2. Look for Promotions</h3>
      <p>Most providers offer promotional rates for new customers. Check for:</p>
      <ul>
        <li>First-year discounts (often 40-50% off)</li>
        <li>Gift card offers ($100-300 back)</li>
        <li>Free installation promotions</li>
        <li>Bundling discounts with mobile service</li>
      </ul>
      <h3>3. Avoid Hidden Costs</h3>
      <ul>
        <li>Buy your own modem/router (saves $10-15/month)</li>
        <li>Check for data caps (overage fees add up)</li>
        <li>Ask about price lock guarantees</li>
      </ul>
      <h3>4. Low-Income Programs</h3>
      <p>You may qualify for discounted internet through:</p>
      <ul>
        <li><strong>ACP:</strong> Up to $30/month discount for qualifying households</li>
        <li><strong>Lifeline:</strong> $9.25/month discount</li>
        <li><strong>Provider programs:</strong> Internet Essentials, Spectrum Internet Assist</li>
      </ul>
    `,
  },
  speed: {
    id: 'speed',
    category: 'Speed Guide',
    title: (city) => `What Internet Speed Do You Need in ${city}?`,
    description: (city) => `Calculate the right internet speed for your household in ${city}.`,
    icon: '⚡',
    color: 'text-cyan-400',
    content: (city, zipCode) => `
      <h2>Internet Speed Guide for ${city}</h2>
      <p>Choosing the right internet speed depends on how many people and devices are in your home, and what you use the internet for.</p>

      <h3>Speed Recommendations by Activity</h3>
      <table>
        <tr><th>Activity</th><th>Minimum Speed</th><th>Recommended</th></tr>
        <tr><td>Email & browsing</td><td>5 Mbps</td><td>25 Mbps</td></tr>
        <tr><td>HD streaming (1080p)</td><td>5 Mbps per stream</td><td>10 Mbps per stream</td></tr>
        <tr><td>4K streaming</td><td>25 Mbps per stream</td><td>35 Mbps per stream</td></tr>
        <tr><td>Video calls (Zoom)</td><td>3 Mbps</td><td>10 Mbps</td></tr>
        <tr><td>Online gaming</td><td>10 Mbps</td><td>50+ Mbps</td></tr>
        <tr><td>Large downloads</td><td>50 Mbps</td><td>200+ Mbps</td></tr>
      </table>

      <h3>Speed by Household Size</h3>
      <ul>
        <li><strong>1-2 people:</strong> 50-100 Mbps</li>
        <li><strong>3-4 people:</strong> 100-300 Mbps</li>
        <li><strong>5+ people:</strong> 300-500 Mbps</li>
        <li><strong>Smart home with many devices:</strong> 500 Mbps - 1 Gbps</li>
      </ul>

      <h3>Understanding Download vs Upload Speed</h3>
      <p><strong>Download speed</strong> affects streaming, browsing, and downloading files. Most activities use download.</p>
      <p><strong>Upload speed</strong> matters for video calls, live streaming, cloud backups, and working from home. Fiber offers symmetrical upload/download; cable typically has much slower upload.</p>
    `,
  },
  fiber: {
    id: 'fiber',
    category: 'Comparison',
    title: (city) => `Fiber vs Cable Internet in ${city}`,
    description: (city) => `Compare fiber and cable internet options in ${city}. Which is better for you?`,
    icon: '🔌',
    color: 'text-blue-400',
    content: (city, zipCode) => `
      <h2>Fiber vs Cable: Which is Better in ${city}?</h2>

      <h3>Fiber Internet</h3>
      <p><strong>Pros:</strong></p>
      <ul>
        <li>Fastest speeds available (up to 8 Gbps)</li>
        <li>Symmetrical upload and download</li>
        <li>Lowest latency for gaming</li>
        <li>Most reliable (less affected by weather, distance)</li>
        <li>Usually no data caps</li>
      </ul>
      <p><strong>Cons:</strong></p>
      <ul>
        <li>Limited availability (check your address)</li>
        <li>Can be more expensive</li>
        <li>Installation may take longer</li>
      </ul>

      <h3>Cable Internet</h3>
      <p><strong>Pros:</strong></p>
      <ul>
        <li>Widely available</li>
        <li>Fast download speeds (up to 1-2 Gbps)</li>
        <li>Usually lower cost than fiber</li>
        <li>Quick installation</li>
      </ul>
      <p><strong>Cons:</strong></p>
      <ul>
        <li>Slower upload speeds (often 10-35 Mbps)</li>
        <li>Shared bandwidth (slower during peak hours)</li>
        <li>May have data caps</li>
      </ul>

      <h3>Our Recommendation</h3>
      <p>Choose <strong>fiber</strong> if available and you need symmetrical speeds or work from home. Choose <strong>cable</strong> if fiber isn't available or you want to save money and mainly stream/browse.</p>
    `,
    filterProviders: (providers) => providers.filter(p =>
      p.technologies?.some(t => ['Fiber', 'Cable'].includes(t))
    ),
  },
  'no-contract': {
    id: 'no-contract',
    category: 'No Contract',
    title: (city) => `No Contract Internet in ${city}`,
    description: (city) => `Internet providers in ${city} with no annual contracts. Month-to-month flexibility.`,
    icon: '📝',
    color: 'text-orange-400',
    content: (city, zipCode) => `
      <h2>No Contract Internet Options in ${city}</h2>
      <p>Many providers now offer month-to-month plans with no long-term commitment. Here's what to know:</p>

      <h3>Benefits of No-Contract Internet</h3>
      <ul>
        <li>Cancel anytime without early termination fees</li>
        <li>Flexibility to switch providers if service is poor</li>
        <li>Good for renters or temporary situations</li>
        <li>Often same speeds as contract plans</li>
      </ul>

      <h3>Potential Drawbacks</h3>
      <ul>
        <li>May miss promotional pricing (contracts often have lower intro rates)</li>
        <li>Prices can increase at any time</li>
        <li>May pay more monthly than contract customers</li>
      </ul>

      <h3>Providers with No-Contract Options</h3>
      <ul>
        <li><strong>Spectrum:</strong> All plans are no-contract</li>
        <li><strong>T-Mobile 5G Home:</strong> No contracts, price lock guarantee</li>
        <li><strong>Verizon 5G Home:</strong> Month-to-month available</li>
        <li><strong>Frontier Fiber:</strong> No annual contracts</li>
        <li><strong>Google Fiber:</strong> No contracts</li>
      </ul>
    `,
  },
  streaming: {
    id: 'streaming',
    category: 'Streaming',
    title: (city) => `Best Internet for Streaming in ${city}`,
    description: (city) => `Find the perfect internet for Netflix, YouTube, and streaming in ${city}.`,
    icon: '📺',
    color: 'text-red-400',
    content: (city, zipCode) => `
      <h2>Best Internet for Streaming in ${city}</h2>

      <h3>Speed Requirements by Quality</h3>
      <ul>
        <li><strong>SD (480p):</strong> 3 Mbps per stream</li>
        <li><strong>HD (1080p):</strong> 5-10 Mbps per stream</li>
        <li><strong>4K Ultra HD:</strong> 25 Mbps per stream</li>
        <li><strong>4K HDR:</strong> 35+ Mbps per stream</li>
      </ul>

      <h3>Calculate Your Needs</h3>
      <p>Multiply streams by quality:</p>
      <ul>
        <li>2 HD streams: 20 Mbps minimum</li>
        <li>2 4K streams: 50-70 Mbps minimum</li>
        <li>4 HD streams + gaming: 100+ Mbps recommended</li>
      </ul>

      <h3>Avoid Data Caps</h3>
      <p>Streaming uses significant data:</p>
      <ul>
        <li>HD streaming: ~3 GB/hour</li>
        <li>4K streaming: ~7 GB/hour</li>
      </ul>
      <p>A household streaming 4 hours daily in 4K uses ~840 GB/month. Look for plans with no data caps or at least 1.2 TB.</p>

      <h3>Best Providers for Streaming</h3>
      <p>Look for: No data caps, consistent speeds, and good evening performance (when most people stream).</p>
    `,
  },
  'work-from-home': {
    id: 'work-from-home',
    category: 'Work From Home',
    title: (city) => `Best Work From Home Internet in ${city}`,
    description: (city) => `Reliable internet for remote work in ${city}. Video calls, VPN, and productivity.`,
    icon: '💼',
    color: 'text-indigo-400',
    content: (city, zipCode) => `
      <h2>Work From Home Internet Guide for ${city}</h2>

      <h3>Requirements for Remote Work</h3>
      <ul>
        <li><strong>Video conferencing:</strong> 10-25 Mbps (upload matters!)</li>
        <li><strong>VPN connection:</strong> 25-50 Mbps for smooth performance</li>
        <li><strong>File uploads/cloud backup:</strong> Higher upload speed = faster transfers</li>
        <li><strong>Multiple workers at home:</strong> Add 25-50 Mbps per person</li>
      </ul>

      <h3>Upload Speed is Critical</h3>
      <p>Unlike streaming, remote work uses significant upload bandwidth:</p>
      <ul>
        <li>Zoom/Teams calls: 3-5 Mbps upload for HD</li>
        <li>Screen sharing: 1-2 Mbps additional</li>
        <li>Cloud file sync: Varies based on file sizes</li>
      </ul>
      <p><strong>Recommendation:</strong> Choose fiber if available for symmetrical upload/download speeds.</p>

      <h3>Reliability Matters Most</h3>
      <p>A dropped connection during a client call is worse than slightly slower speeds. Prioritize:</p>
      <ul>
        <li>Wired connections when possible</li>
        <li>Fiber or cable over satellite/wireless</li>
        <li>Providers with good uptime reputation</li>
        <li>Having a backup option (mobile hotspot)</li>
      </ul>
    `,
    filterProviders: (providers) => providers.filter(p =>
      p.technologies?.some(t => ['Fiber', 'Cable'].includes(t))
    ),
  },
  family: {
    id: 'family',
    category: 'Family',
    title: (city) => `Best Internet for Families in ${city}`,
    description: (city) => `Internet plans that handle multiple devices and users in ${city}.`,
    icon: '👨‍👩‍👧‍👦',
    color: 'text-pink-400',
    content: (city, zipCode) => `
      <h2>Best Internet for Families in ${city}</h2>

      <h3>How Many Devices Does Your Family Use?</h3>
      <p>Modern families often have 10-20+ connected devices:</p>
      <ul>
        <li>Phones (1 per person)</li>
        <li>Tablets and laptops</li>
        <li>Smart TVs (often multiple)</li>
        <li>Gaming consoles</li>
        <li>Smart home devices (thermostats, cameras, speakers)</li>
      </ul>

      <h3>Recommended Speeds by Family Size</h3>
      <ul>
        <li><strong>2-3 people:</strong> 100-200 Mbps</li>
        <li><strong>4-5 people:</strong> 200-400 Mbps</li>
        <li><strong>6+ people:</strong> 500 Mbps - 1 Gbps</li>
      </ul>

      <h3>Features Families Need</h3>
      <ul>
        <li><strong>No data caps:</strong> Kids streaming and gaming uses lots of data</li>
        <li><strong>Parental controls:</strong> Many routers include content filtering</li>
        <li><strong>Strong WiFi:</strong> Mesh systems for whole-home coverage</li>
        <li><strong>Reliability:</strong> For homework and work-from-home</li>
      </ul>

      <h3>Money-Saving Tips</h3>
      <ul>
        <li>Bundle with mobile for family discounts</li>
        <li>Buy your own router (better features, no rental fee)</li>
        <li>Don't overpay for speeds you won't use</li>
      </ul>
    `,
  },
}

interface Provider {
  name: string
  technologies: string[]
  coverage_pct: number
}

async function getLocationInfo(zipCode: string) {
  const supabase = createAdminClient()

  // Get city name from zip_broadband_coverage (same as compare page)
  const { data: coverageData } = await supabase
    .from('zip_broadband_coverage')
    .select('city')
    .eq('zip_code', zipCode)
    .single()

  // Get CBSA code for provider lookup
  const { data: zipData } = await supabase
    .from('zip_cbsa_mapping')
    .select('cbsa_code')
    .eq('zip_code', zipCode)
    .single()

  const city = coverageData?.city || `ZIP ${zipCode}`
  const cbsaCode = zipData?.cbsa_code || null

  return { city, cbsaCode }
}

async function getProviders(zipCode: string): Promise<Provider[]> {
  const supabase = createAdminClient()

  // Get CBSA for this ZIP
  const { data: zipData } = await supabase
    .from('zip_cbsa_mapping')
    .select('cbsa_code')
    .eq('zip_code', zipCode)
    .single()

  if (!zipData?.cbsa_code) return []

  // Get providers for this CBSA
  const { data: cbsaProviders } = await supabase
    .from('cbsa_providers')
    .select('provider_id, coverage_pct')
    .eq('cbsa_code', zipData.cbsa_code)
    .order('coverage_pct', { ascending: false })
    .limit(15)

  if (!cbsaProviders || cbsaProviders.length === 0) return []

  // Get provider names
  const providerIds = cbsaProviders.map(p => p.provider_id)
  const { data: providerNames } = await supabase
    .from('fcc_providers')
    .select('provider_id, name')
    .in('provider_id', providerIds)

  const nameMap = new Map(providerNames?.map(p => [p.provider_id, p.name]) || [])

  // Determine technologies based on provider name
  return cbsaProviders.map(p => {
    const name = nameMap.get(p.provider_id) || 'Unknown'
    const lowerName = name.toLowerCase()

    let technologies: string[] = []
    if (lowerName.includes('fiber') || lowerName.includes('fios') || lowerName.includes('frontier') || lowerName.includes('google')) {
      technologies.push('Fiber')
    }
    if (lowerName.includes('comcast') || lowerName.includes('xfinity') || lowerName.includes('spectrum') || lowerName.includes('cox') || lowerName.includes('charter')) {
      technologies.push('Cable')
    }
    if (lowerName.includes('at&t') || lowerName.includes('verizon') || lowerName.includes('centurylink')) {
      technologies.push('Fiber', 'DSL')
    }
    if (lowerName.includes('t-mobile') || lowerName.includes('verizon wireless')) {
      technologies.push('5G')
    }
    if (lowerName.includes('starlink') || lowerName.includes('viasat') || lowerName.includes('hughesnet')) {
      technologies.push('Satellite')
    }
    if (technologies.length === 0) {
      technologies.push('Internet')
    }

    // Clean provider name for display
    let displayName = name
      .replace(/, Inc\.|Inc\.|Corporation|Corp\.|LLC/g, '')
      .replace('Charter Communications', 'Spectrum')
      .replace('Comcast Cable', 'Xfinity')
      .replace('Space Exploration Technologies', 'Starlink')
      .trim()

    return {
      name: displayName,
      technologies: [...new Set(technologies)],
      coverage_pct: Math.round(p.coverage_pct * 100),
    }
  })
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const { zip } = await searchParams

  const template = guideTemplates[slug]
  if (!template) {
    return { title: 'Guide Not Found' }
  }

  const locationInfo = zip ? await getLocationInfo(zip) : { city: 'Your Area' }

  return {
    title: template.title(locationInfo.city),
    description: template.description(locationInfo.city),
  }
}

export default async function GuidePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { zip } = await searchParams

  const template = guideTemplates[slug]
  if (!template) {
    notFound()
  }

  const zipCode = zip || ''
  const locationInfo = zipCode ? await getLocationInfo(zipCode) : { city: 'Your Area', cbsaCode: null }
  const allProviders = zipCode ? await getProviders(zipCode) : []

  // Apply template-specific provider filter
  const providers = template.filterProviders
    ? template.filterProviders(allProviders)
    : allProviders

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/guides${zipCode ? `?zip=${zipCode}` : ''}`} className="hover:text-white">Guides</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{template.category}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gray-800 ${template.color}`}>
              {template.icon} {template.category}
            </span>
            {zipCode && <span className="text-gray-500 text-sm">{zipCode}</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{template.title(locationInfo.city)}</h1>
          <p className="text-xl text-gray-400">{template.description(locationInfo.city)}</p>
        </div>

        {/* Quick Stats */}
        {zipCode && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{allProviders.length}</div>
              <div className="text-sm text-gray-400">Providers Available</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {allProviders.filter(p => p.technologies.includes('Fiber')).length}
              </div>
              <div className="text-sm text-gray-400">Fiber Options</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{zipCode}</div>
              <div className="text-sm text-gray-400">ZIP Code</div>
            </div>
          </div>
        )}

        {/* Guide Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8 prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: template.content(locationInfo.city, zipCode) }} />
        </div>

        {/* Providers */}
        {zipCode && providers.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {template.filterProviders ? 'Recommended Providers' : 'Available Providers'} in {locationInfo.city}
            </h2>
            <div className="space-y-4">
              {providers.slice(0, 8).map((provider, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <div className="flex gap-2 mt-1">
                      {provider.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-400">{provider.coverage_pct}%</div>
                    <div className="text-xs text-gray-500">coverage</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No ZIP warning */}
        {!zipCode && (
          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-6 mb-8 text-center">
            <p className="text-yellow-200 mb-4">
              Enter your ZIP code to see providers available in your area
            </p>
            <Link
              href="/guides"
              className="inline-flex items-center justify-center px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
            >
              Enter ZIP Code
            </Link>
          </div>
        )}

        {/* CTA */}
        {zipCode && (
          <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Compare All Providers in {locationInfo.city}</h2>
            <p className="text-gray-400 mb-6">
              See detailed plans, pricing, and availability for your address
            </p>
            <Link
              href={`/compare?zip=${zipCode}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View All {allProviders.length} Providers
            </Link>
          </div>
        )}

        {/* Related Guides */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">More Guides{zipCode ? ` for ${locationInfo.city}` : ''}</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(guideTemplates).map(([key, t]) => (
              key !== slug && (
                <Link
                  key={key}
                  href={`/guides/${key}${zipCode ? `?zip=${zipCode}` : ''}`}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition-colors"
                >
                  {t.icon} {t.category}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
