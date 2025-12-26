'use client'

import { TipBox, ProsConsCard, SpeedTable, StepGuide } from '@/components/guides'
import { motion } from 'framer-motion'
import {
  Zap, Shield, DollarSign, Clock, Gauge, Upload,
  Tv, Video, Gamepad2, Users, Laptop, Smartphone,
  Mail, Download, Monitor, Wifi
} from 'lucide-react'

interface Provider {
  name: string
  technologies: string[]
  coverage_pct: number
}

interface GuideContentProps {
  slug: string
  city: string
  zipCode: string
  providers: Provider[]
  allProviders: Provider[]
  gradient: string
}

// Content Section Component
function ContentSection({
  title,
  children,
  gradient = 'from-cyan-400 to-blue-400',
}: {
  title: string
  children: React.ReactNode
  gradient?: string
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mb-10"
    >
      <h2 className={`text-2xl font-bold mb-6 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {title}
      </h2>
      <div className="space-y-4 text-gray-300">
        {children}
      </div>
    </motion.section>
  )
}

// Bullet List Component
function BulletList({ items }: { items: Array<{ title: string; description: string }> }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
          <div>
            <span className="font-medium text-white">{item.title}</span>
            {item.description && <span className="text-gray-400"> - {item.description}</span>}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function GuideContent({ slug, city }: GuideContentProps) {
  // Render guide-specific content based on slug
  switch (slug) {
    case 'best-internet-providers':
      return <BestInternetProvidersContent city={city} />
    case 'gaming':
      return <GamingContent city={city} />
    case 'budget':
      return <BudgetContent city={city} />
    case 'speed':
      return <SpeedContent city={city} />
    case 'fiber':
      return <FiberContent city={city} />
    case 'no-contract':
      return <NoContractContent city={city} />
    case 'streaming':
      return <StreamingContent city={city} />
    case 'work-from-home':
      return <WorkFromHomeContent city={city} />
    case 'family':
      return <FamilyContent city={city} />
    default:
      return <DefaultContent city={city} />
  }
}

// ==================== GUIDE CONTENT SECTIONS ====================

function BestInternetProvidersContent({ city }: { city: string }) {
  return (
    <>
      <ContentSection title="What Makes a Provider the Best?">
        <p>
          The &quot;best&quot; internet provider depends on your specific needs. Here&apos;s what to prioritize:
        </p>
        <BulletList
          items={[
            { title: 'Availability', description: 'The best provider is one that actually services your exact address' },
            { title: 'Reliability', description: 'Consistent uptime matters more than peak speeds' },
            { title: 'Speed', description: 'Match your household usage - don\'t overpay for speed you won\'t use' },
            { title: 'Price', description: 'Factor in equipment rental, fees, and price increases after promo period' },
          ]}
        />
      </ContentSection>

      <ContentSection title="Provider Types Ranked" gradient="from-green-400 to-emerald-400">
        <div className="grid gap-4">
          {[
            { rank: 1, type: 'Fiber', desc: 'Fastest, most reliable, symmetrical speeds. Best overall if available.' },
            { rank: 2, type: 'Cable', desc: 'Widely available, fast downloads, but shared bandwidth during peak hours.' },
            { rank: 3, type: '5G Home', desc: 'No wired install needed, improving quickly, but availability is limited.' },
            { rank: 4, type: 'DSL', desc: 'Older technology, slower speeds, but sometimes the only wired option.' },
            { rank: 5, type: 'Satellite', desc: 'Available everywhere but high latency and data caps. Last resort.' },
          ].map((item) => (
            <div key={item.rank} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{item.rank}</span>
              </div>
              <div>
                <div className="font-semibold text-white">{item.type}</div>
                <div className="text-sm text-gray-400">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      <TipBox variant="warning" title="Red Flags to Avoid">
        Watch out for: prices that jump 40%+ after the promo period, strict data caps with expensive overages,
        long contracts with $200+ early termination fees, and mandatory equipment rental at $15+/month.
      </TipBox>

      <ProsConsCard
        title="How to Evaluate Providers"
        pros={[
          'Check actual availability at your exact address',
          'Compare total cost including all fees',
          'Read recent reviews for your area',
          'Ask about price lock guarantees',
        ]}
        cons={[
          'Trusting advertised speeds without verifying',
          'Ignoring the post-promotional price',
          'Signing long contracts before testing service',
          'Renting equipment when you could buy',
        ]}
      />
    </>
  )
}

function GamingContent({ city }: { city: string }) {
  return (
    <>
      <ContentSection title="What Gamers Actually Need">
        <p>
          Forget the marketing hype about &quot;gaming internet.&quot; Here&apos;s what actually matters for online gaming:
        </p>
        <BulletList
          items={[
            { title: 'Low Latency (Ping)', description: 'Under 20ms is ideal. This affects your reaction time in-game.' },
            { title: 'Stable Connection', description: 'Consistent ping matters more than occasional fast speeds.' },
            { title: 'Upload Speed', description: 'Minimum 5 Mbps for gameplay, 10+ Mbps if streaming on Twitch/YouTube.' },
          ]}
        />
      </ContentSection>

      <SpeedTable
        title="Gaming Speed Requirements"
        rows={[
          { activity: 'Casual online games', minSpeed: '10 Mbps', recommended: '25 Mbps', icon: <Gamepad2 className="w-4 h-4" /> },
          { activity: 'Competitive FPS/Battle Royale', minSpeed: '25 Mbps', recommended: '50 Mbps', icon: <Zap className="w-4 h-4" /> },
          { activity: 'Streaming while gaming (1080p)', minSpeed: '15 Mbps upload', recommended: '25 Mbps upload', icon: <Video className="w-4 h-4" /> },
          { activity: 'Game downloads & updates', minSpeed: '50 Mbps', recommended: '200+ Mbps', icon: <Download className="w-4 h-4" /> },
        ]}
      />

      <TipBox variant="pro-tip" title="Reduce Ping Instantly">
        Use a wired ethernet connection instead of WiFi. This alone can reduce ping by 10-50ms
        and eliminate the packet loss that causes rubber-banding and disconnects.
      </TipBox>

      <ContentSection title="Best Connection Types for Gaming" gradient="from-purple-400 to-pink-400">
        <ProsConsCard
          title="Fiber vs Cable for Gaming"
          pros={[
            'Fiber: Lowest latency (5-15ms typical)',
            'Fiber: Symmetrical upload for streaming',
            'Cable: More widely available',
            'Cable: Fast downloads for game updates',
          ]}
          cons={[
            'Fiber: Limited availability in many areas',
            'Cable: Congestion during peak hours',
            'Satellite: 400-600ms latency - unplayable for online games',
            '5G: Variable latency, improving but not ideal for competitive',
          ]}
        />
      </ContentSection>

      <TipBox variant="warning" title="Avoid These for Competitive Gaming">
        Satellite internet has 400-600ms latency - completely unusable for real-time games. Fixed wireless
        and some 5G connections have variable latency that can spike during matches. Stick with fiber or cable.
      </TipBox>
    </>
  )
}

function BudgetContent({ city }: { city: string }) {
  return (
    <>
      <ContentSection title="How to Save on Internet">
        <p>
          You don&apos;t need to sacrifice quality for affordability. Here&apos;s how to get the best value:
        </p>
      </ContentSection>

      <StepGuide
        title="5 Steps to Lower Your Internet Bill"
        gradient="from-green-500 to-emerald-500"
        steps={[
          {
            title: 'Right-size your speed',
            description: 'Most households need 100-200 Mbps, not 500+. Don\'t pay for speed you won\'t use.',
            Icon: Gauge,
          },
          {
            title: 'Buy your own equipment',
            description: 'Skip the $10-15/month rental fee. A good modem/router combo pays for itself in 6-8 months.',
            Icon: Wifi,
          },
          {
            title: 'Negotiate when promos end',
            description: 'Call and say you\'re considering switching. They\'ll often extend your promotional rate.',
            Icon: DollarSign,
          },
          {
            title: 'Check for assistance programs',
            description: 'ACP provides $30/month discount for qualifying households. Many ISPs have low-income plans.',
            Icon: Shield,
          },
          {
            title: 'Bundle strategically',
            description: 'Mobile + home internet bundles (T-Mobile, Verizon) can save $20-40/month total.',
            Icon: Smartphone,
          },
        ]}
      />

      <SpeedTable
        title="Speed vs Cost Guide"
        rows={[
          { activity: '1-2 people, basic browsing', minSpeed: '25 Mbps', recommended: '50 Mbps ($25-35/mo)', icon: <Users className="w-4 h-4" /> },
          { activity: '2-3 people, HD streaming', minSpeed: '50 Mbps', recommended: '100 Mbps ($35-50/mo)', icon: <Tv className="w-4 h-4" /> },
          { activity: '3-4 people, heavy use', minSpeed: '100 Mbps', recommended: '200 Mbps ($50-65/mo)', icon: <Users className="w-4 h-4" /> },
          { activity: '5+ people, power users', minSpeed: '200 Mbps', recommended: '300-500 Mbps ($60-80/mo)', icon: <Zap className="w-4 h-4" /> },
        ]}
      />

      <TipBox variant="success" title="Providers with No Data Caps">
        AT&T Fiber, Google Fiber, Verizon Fios, Frontier Fiber, and Spectrum all offer unlimited data.
        Avoid plans with caps if you stream heavily - overage fees can add $50+/month.
      </TipBox>

      <TipBox variant="tip" title="Hidden Fees to Watch">
        Always ask about: installation fees ($50-100), equipment rental ($10-15/mo), broadcast TV fees
        (if bundling), and price after promotional period ends (often 40-60% higher).
      </TipBox>
    </>
  )
}

function SpeedContent({ city }: { city: string }) {
  return (
    <>
      <ContentSection title="Calculate Your Speed Needs">
        <p>
          Internet speed is measured in Mbps (megabits per second). Here&apos;s how to figure out what your household actually needs:
        </p>
      </ContentSection>

      <SpeedTable
        title="Speed Requirements by Activity"
        rows={[
          { activity: 'Email & web browsing', minSpeed: '5 Mbps', recommended: '25 Mbps', icon: <Mail className="w-4 h-4" /> },
          { activity: 'HD video streaming (1080p)', minSpeed: '5 Mbps', recommended: '10 Mbps per stream', icon: <Tv className="w-4 h-4" /> },
          { activity: '4K video streaming', minSpeed: '25 Mbps', recommended: '35 Mbps per stream', icon: <Monitor className="w-4 h-4" /> },
          { activity: 'Video calls (Zoom/Teams)', minSpeed: '3 Mbps', recommended: '10 Mbps', icon: <Video className="w-4 h-4" /> },
          { activity: 'Online gaming', minSpeed: '10 Mbps', recommended: '50+ Mbps', icon: <Gamepad2 className="w-4 h-4" /> },
          { activity: 'Working from home (VPN)', minSpeed: '25 Mbps', recommended: '50-100 Mbps', icon: <Laptop className="w-4 h-4" /> },
          { activity: 'Large file downloads', minSpeed: '50 Mbps', recommended: '200+ Mbps', icon: <Download className="w-4 h-4" /> },
        ]}
      />

      <ContentSection title="Speed by Household Size" gradient="from-purple-400 to-pink-400">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { size: '1-2 people', speed: '50-100 Mbps', note: 'Handles streaming + browsing easily' },
            { size: '3-4 people', speed: '100-300 Mbps', note: 'Multiple simultaneous 4K streams' },
            { size: '5+ people', speed: '300-500 Mbps', note: 'Heavy concurrent usage' },
            { size: 'Smart home', speed: '500 Mbps - 1 Gbps', note: 'Many IoT devices + heavy use' },
          ].map((item) => (
            <div key={item.size} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="text-lg font-bold text-white">{item.size}</div>
              <div className="text-cyan-400 font-medium">{item.speed}</div>
              <div className="text-sm text-gray-400 mt-1">{item.note}</div>
            </div>
          ))}
        </div>
      </ContentSection>

      <TipBox variant="tip" title="Download vs Upload Speed">
        <strong>Download</strong> affects streaming, browsing, and downloading files - most activities use this.
        <strong className="block mt-2">Upload</strong> matters for video calls, live streaming, cloud backups, and remote work.
        Fiber offers symmetrical speeds (same up/down). Cable typically has much slower upload (10-35 Mbps).
      </TipBox>

      <TipBox variant="pro-tip" title="Don&apos;t Overbuy Speed">
        A 1 Gbps plan sounds impressive, but most households can&apos;t actually use that much.
        Your router, device WiFi chips, and website servers often can&apos;t deliver full gigabit.
        200-300 Mbps is plenty for most heavy users.
      </TipBox>
    </>
  )
}

function FiberContent({ city }: { city: string }) {
  return (
    <>
      <ContentSection title={`Fiber vs Cable in ${city}`}>
        <p>
          If fiber is available at your address, it&apos;s usually the better choice. Here&apos;s the full breakdown:
        </p>
      </ContentSection>

      <ProsConsCard
        title="Fiber Internet"
        pros={[
          'Fastest speeds available (up to 8 Gbps with some providers)',
          'Symmetrical upload and download speeds',
          'Lowest latency - ideal for gaming and video calls',
          'Most reliable (not affected by weather or distance)',
          'Usually no data caps',
        ]}
        cons={[
          'Limited availability - check your exact address',
          'Can cost more than cable in some areas',
          'Installation may require running new lines (takes longer)',
        ]}
      />

      <ProsConsCard
        title="Cable Internet"
        pros={[
          'Widely available in most urban/suburban areas',
          'Fast download speeds (up to 1-2 Gbps)',
          'Often cheaper than fiber',
          'Quick installation - uses existing coax lines',
        ]}
        cons={[
          'Asymmetrical speeds - upload typically 10-35 Mbps',
          'Shared bandwidth - can slow during peak evening hours',
          'May have data caps (1.2 TB is common)',
          'Higher latency than fiber',
        ]}
      />

      <TipBox variant="success" title="When to Choose Fiber">
        Choose fiber if you: work from home (need upload speed), game competitively (need low latency),
        have 4+ simultaneous heavy users, or want the most reliable connection possible.
      </TipBox>

      <TipBox variant="tip" title="When Cable Makes Sense">
        Choose cable if: fiber isn&apos;t available, you&apos;re on a tight budget, you mainly stream/browse
        (don&apos;t need fast upload), or you need quick installation.
      </TipBox>

      <ContentSection title="Speed Comparison" gradient="from-green-400 to-emerald-400">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-400 font-medium">Metric</th>
                <th className="py-3 px-4 text-green-400 font-medium">Fiber</th>
                <th className="py-3 px-4 text-blue-400 font-medium">Cable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              <tr>
                <td className="py-3 px-4 text-gray-300">Max Download</td>
                <td className="py-3 px-4 text-white">Up to 8 Gbps</td>
                <td className="py-3 px-4 text-white">Up to 2 Gbps</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-300">Max Upload</td>
                <td className="py-3 px-4 text-white">Up to 8 Gbps</td>
                <td className="py-3 px-4 text-white">10-35 Mbps typical</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-300">Latency (Ping)</td>
                <td className="py-3 px-4 text-white">5-15ms</td>
                <td className="py-3 px-4 text-white">15-30ms</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-300">Reliability</td>
                <td className="py-3 px-4 text-white">Excellent</td>
                <td className="py-3 px-4 text-white">Good</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ContentSection>
    </>
  )
}

function NoContractContent({ city }: { city: string }) {
  return (
    <>
      <ContentSection title="Why Go No-Contract?">
        <p>
          Month-to-month internet plans give you flexibility without long-term commitment. Here&apos;s what to know:
        </p>
      </ContentSection>

      <ProsConsCard
        title="No-Contract Internet"
        pros={[
          'Cancel anytime without early termination fees',
          'Switch providers if service quality drops',
          'Great for renters or temporary living situations',
          'Same speeds as contract plans',
          'No credit check required with some providers',
        ]}
        cons={[
          'May miss promotional pricing (contracts often have lower intro rates)',
          'Monthly price can increase at any time',
          'May pay $10-20 more per month than contract customers',
        ]}
      />

      <ContentSection title="Providers with No Contracts" gradient="from-orange-400 to-amber-400">
        <div className="grid gap-4">
          {[
            { name: 'Spectrum', note: 'All plans are no-contract by default. Price lock for 2 years.' },
            { name: 'T-Mobile 5G Home', note: 'No contracts, price lock guarantee. $50/mo with autopay.' },
            { name: 'Verizon 5G Home', note: 'Month-to-month available. Best with Verizon mobile discount.' },
            { name: 'Google Fiber', note: 'No contracts, no data caps, no price increases during service.' },
            { name: 'Frontier Fiber', note: 'No annual contracts on most plans.' },
          ].map((provider) => (
            <div key={provider.name} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">{provider.name}</div>
                <div className="text-sm text-gray-400">{provider.note}</div>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      <TipBox variant="tip" title="Price Lock vs No Contract">
        Some providers offer &quot;price lock&quot; guarantees - your rate won&apos;t increase for 1-2 years even without a contract.
        This gives you the best of both worlds: stable pricing + cancellation flexibility.
      </TipBox>

      <TipBox variant="warning" title="Watch for Hidden Commitments">
        Some providers advertise &quot;no contract&quot; but charge installation fees or equipment costs that effectively
        create commitment. Ask about all upfront costs before signing up.
      </TipBox>
    </>
  )
}

function StreamingContent({ city }: { city: string }) {
  return (
    <>
      <ContentSection title="Speed Requirements for Streaming">
        <p>
          Different streaming quality levels require different speeds. Here&apos;s what you need:
        </p>
      </ContentSection>

      <SpeedTable
        title="Streaming Speed Guide"
        rows={[
          { activity: 'SD (480p)', minSpeed: '3 Mbps', recommended: '5 Mbps per stream', icon: <Tv className="w-4 h-4" /> },
          { activity: 'HD (1080p)', minSpeed: '5 Mbps', recommended: '10 Mbps per stream', icon: <Tv className="w-4 h-4" /> },
          { activity: '4K Ultra HD', minSpeed: '25 Mbps', recommended: '35 Mbps per stream', icon: <Monitor className="w-4 h-4" /> },
          { activity: '4K HDR/Dolby Vision', minSpeed: '35 Mbps', recommended: '50 Mbps per stream', icon: <Monitor className="w-4 h-4" /> },
        ]}
      />

      <ContentSection title="Data Usage Warning" gradient="from-red-400 to-orange-400">
        <p className="text-lg">
          Streaming uses significant data. If your plan has a data cap, you need to track usage:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="text-2xl font-bold text-white">~3 GB/hour</div>
            <div className="text-gray-400">HD (1080p) streaming</div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="text-2xl font-bold text-white">~7 GB/hour</div>
            <div className="text-gray-400">4K streaming</div>
          </div>
        </div>
        <p className="mt-4 text-gray-400">
          A family streaming 4 hours daily in 4K uses ~840 GB/month. Most cable caps are 1.2 TB.
        </p>
      </ContentSection>

      <TipBox variant="success" title="Providers with No Data Caps">
        For heavy streaming households, choose providers without data caps: AT&T Fiber, Google Fiber,
        Verizon Fios, Frontier Fiber, Spectrum, and most fiber providers.
      </TipBox>

      <TipBox variant="pro-tip" title="Optimize Your Streaming">
        Use ethernet for your main TV instead of WiFi for consistent 4K quality. If you have buffering issues,
        it&apos;s often your WiFi, not your internet speed. A good WiFi 6 router can make a huge difference.
      </TipBox>
    </>
  )
}

function WorkFromHomeContent({ city }: { city: string }) {
  return (
    <>
      <ContentSection title="Remote Work Requirements">
        <p>
          Working from home requires reliable internet with good upload speed. Here&apos;s what you need:
        </p>
      </ContentSection>

      <SpeedTable
        title="Work From Home Speed Guide"
        rows={[
          { activity: 'Email & document work', minSpeed: '10 Mbps', recommended: '25 Mbps', icon: <Mail className="w-4 h-4" /> },
          { activity: 'Video calls (HD)', minSpeed: '5 Mbps upload', recommended: '10 Mbps upload', icon: <Video className="w-4 h-4" /> },
          { activity: 'Screen sharing', minSpeed: '3 Mbps upload', recommended: '5 Mbps upload', icon: <Monitor className="w-4 h-4" /> },
          { activity: 'VPN connection', minSpeed: '25 Mbps', recommended: '50 Mbps', icon: <Shield className="w-4 h-4" /> },
          { activity: 'Cloud file sync', minSpeed: '10 Mbps upload', recommended: '25+ Mbps upload', icon: <Upload className="w-4 h-4" /> },
        ]}
      />

      <TipBox variant="warning" title="Upload Speed is Critical">
        Most work-from-home activities use upload bandwidth. Cable internet typically has 10-35 Mbps upload -
        which can struggle with HD video calls + file uploads simultaneously. Fiber offers symmetrical speeds
        (equal upload and download) which is ideal for remote work.
      </TipBox>

      <StepGuide
        title="Optimize Your Home Office Setup"
        gradient="from-indigo-500 to-blue-500"
        steps={[
          {
            title: 'Use a wired connection',
            description: 'Ethernet is more stable than WiFi for video calls. Eliminates random drops and quality issues.',
            Icon: Wifi,
          },
          {
            title: 'Test your upload speed',
            description: 'Run a speed test. If upload is under 10 Mbps, consider upgrading to fiber.',
            Icon: Gauge,
          },
          {
            title: 'Have a backup plan',
            description: 'Keep mobile hotspot as backup. T-Mobile/Verizon offer hotspot devices for $50-100/mo.',
            Icon: Smartphone,
          },
          {
            title: 'Schedule large uploads',
            description: 'Sync large files overnight or during off-hours to avoid impacting video calls.',
            Icon: Clock,
          },
        ]}
      />

      <TipBox variant="tip" title="Multiple Remote Workers">
        If two or more people work from home simultaneously, multiply your requirements. Two HD video calls
        need at least 20 Mbps upload. Consider 100+ Mbps symmetrical fiber for smooth experience.
      </TipBox>
    </>
  )
}

function FamilyContent({ city }: { city: string }) {
  return (
    <>
      <ContentSection title="Internet Needs for Families">
        <p>
          Modern families have many devices competing for bandwidth. Here&apos;s how to size your plan:
        </p>
      </ContentSection>

      <ContentSection title="Count Your Devices" gradient="from-pink-400 to-rose-400">
        <p className="mb-4">The average family has 10-20+ connected devices:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: Smartphone, name: 'Phones', note: '1 per person' },
            { icon: Laptop, name: 'Laptops/Tablets', note: '1-2 each' },
            { icon: Tv, name: 'Smart TVs', note: '2-4 typical' },
            { icon: Gamepad2, name: 'Gaming consoles', note: '1-3 typical' },
            { icon: Monitor, name: 'Smart speakers', note: '2-5 common' },
            { icon: Shield, name: 'Security cameras', note: '2-6 cameras' },
          ].map((device) => (
            <div key={device.name} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <device.icon className="w-5 h-5 text-pink-400 mb-2" />
              <div className="font-medium text-white text-sm">{device.name}</div>
              <div className="text-xs text-gray-500">{device.note}</div>
            </div>
          ))}
        </div>
      </ContentSection>

      <SpeedTable
        title="Speed by Family Size"
        rows={[
          { activity: '2-3 people', minSpeed: '100 Mbps', recommended: '200 Mbps', icon: <Users className="w-4 h-4" /> },
          { activity: '4-5 people', minSpeed: '200 Mbps', recommended: '400 Mbps', icon: <Users className="w-4 h-4" /> },
          { activity: '6+ people', minSpeed: '300 Mbps', recommended: '500 Mbps - 1 Gbps', icon: <Users className="w-4 h-4" /> },
          { activity: 'Smart home + heavy use', minSpeed: '500 Mbps', recommended: '1 Gbps', icon: <Zap className="w-4 h-4" /> },
        ]}
      />

      <TipBox variant="tip" title="Features Families Need">
        Look for: no data caps (kids gaming and streaming use lots of data), parental controls built into the router,
        mesh WiFi for whole-home coverage, and enough speed for everyone during peak evening hours.
      </TipBox>

      <TipBox variant="success" title="Save Money with Bundles">
        If you have multiple phone lines, bundling mobile + home internet can save $20-40/month.
        T-Mobile and Verizon offer the best family bundle discounts. Also buy your own router -
        saves $10-15/month and usually offers better parental controls.
      </TipBox>
    </>
  )
}

function DefaultContent({ city }: { city: string }) {
  return (
    <ContentSection title={`Internet Guide for ${city}`}>
      <p>
        This guide will help you find the best internet service for your needs.
        Check the providers available in your area and compare speeds, prices, and features.
      </p>
    </ContentSection>
  )
}
