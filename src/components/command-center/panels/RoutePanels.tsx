'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCommandCenter } from '@/contexts/CommandCenterContext'

// Tools Panel
export function ToolsPanel() {
  const { showPanel } = useCommandCenter()

  const tools = [
    {
      name: 'Speed Test',
      description: 'Test your current internet speed',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
      action: () => showPanel('speedTest'),
    },
    {
      name: 'Coverage Check',
      description: 'See what providers cover your area',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500',
      action: () => showPanel('coverage'),
    },
    {
      name: 'Provider Quiz',
      description: 'Find the best provider for your needs',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-cyan-500 to-blue-500',
      action: () => showPanel('quiz'),
    },
    {
      name: 'Address Availability',
      description: 'Check providers at your exact address',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-500',
      action: () => showPanel('addressAvailability'),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Internet Tools</h2>
        <p className="text-gray-400">Helpful tools to find and compare internet service</p>
      </div>

      <div className="grid gap-4">
        {tools.map((tool, index) => (
          <motion.button
            key={tool.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={tool.action}
            className="w-full p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${tool.gradient} text-white`}>
                {tool.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{tool.description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Guides Panel
export function GuidesPanel() {
  const guides = [
    { title: 'What Internet Speed Do I Need?', slug: 'internet-speed-guide', category: 'Basics' },
    { title: 'Fiber vs Cable vs DSL', slug: 'fiber-vs-cable-vs-dsl', category: 'Comparison' },
    { title: 'How to Lower Your Internet Bill', slug: 'lower-internet-bill', category: 'Savings' },
    { title: 'Best Internet for Gaming', slug: 'best-internet-for-gaming', category: 'Gaming' },
    { title: 'Work From Home Internet Guide', slug: 'work-from-home-internet', category: 'Remote Work' },
    { title: 'Understanding Internet Contracts', slug: 'internet-contracts-guide', category: 'Basics' },
  ]

  const categories = ['All', 'Basics', 'Comparison', 'Savings', 'Gaming', 'Remote Work']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Internet Guides</h2>
        <p className="text-gray-400">Learn everything about choosing and using internet service</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              cat === 'All'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Guides list */}
      <div className="space-y-3">
        {guides.map((guide, index) => (
          <motion.div
            key={guide.slug}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={`/guides/${guide.slug}`}
              className="block p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-cyan-400 font-medium">{guide.category}</span>
                  <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors mt-1">
                    {guide.title}
                  </h3>
                </div>
                <svg className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <Link
        href="/guides"
        className="block text-center text-cyan-400 hover:text-cyan-300 text-sm font-medium"
      >
        View all guides →
      </Link>
    </div>
  )
}

// Plans Panel
export function PlansPanel() {
  const { showPanel, context } = useCommandCenter()

  const planTypes = [
    { name: 'Budget Plans', description: 'Under $50/month', icon: '💰' },
    { name: 'Best Value', description: 'Speed + Price balance', icon: '⭐' },
    { name: 'High Speed', description: '500+ Mbps plans', icon: '🚀' },
    { name: 'No Contract', description: 'Month-to-month options', icon: '🔓' },
    { name: 'Fiber Plans', description: 'Fastest technology', icon: '💡' },
    { name: 'Unlimited Data', description: 'No data caps', icon: '♾️' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Internet Plans</h2>
        <p className="text-gray-400">Find the perfect plan for your needs and budget</p>
      </div>

      {context.zipCode ? (
        <>
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <p className="text-sm text-cyan-400">
              Showing plans available in <span className="font-bold">{context.zipCode}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {planTypes.map((type, index) => (
              <motion.button
                key={type.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => showPanel('recommendations', { zipCode: context.zipCode, filter: type.name })}
                className="p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-cyan-500/30 rounded-xl transition-all text-left"
              >
                <span className="text-2xl mb-2 block">{type.icon}</span>
                <h3 className="font-medium text-white text-sm">{type.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Enter your ZIP code to see available plans</p>
          <p className="text-sm text-gray-500">Ask the AI assistant for help finding plans in your area</p>
        </div>
      )}
    </div>
  )
}

// Providers Panel
export function ProvidersPanel() {
  const { showPanel } = useCommandCenter()

  const topProviders = [
    { name: 'AT&T', slug: 'att-internet', type: 'Fiber & DSL' },
    { name: 'Spectrum', slug: 'spectrum', type: 'Cable' },
    { name: 'Xfinity', slug: 'xfinity', type: 'Cable' },
    { name: 'Verizon Fios', slug: 'verizon-fios', type: 'Fiber' },
    { name: 'T-Mobile', slug: 't-mobile', type: '5G Home' },
    { name: 'Google Fiber', slug: 'google-fiber', type: 'Fiber' },
    { name: 'Frontier', slug: 'frontier', type: 'Fiber' },
    { name: 'Cox', slug: 'cox', type: 'Cable' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Internet Providers</h2>
        <p className="text-gray-400">Compare top internet service providers</p>
      </div>

      <div className="space-y-2">
        {topProviders.map((provider, index) => (
          <motion.button
            key={provider.slug}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => showPanel('providerDetail', { providerSlug: provider.slug, providerName: provider.name })}
            className="w-full p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all text-left group flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {provider.name}
              </h3>
              <p className="text-sm text-gray-500">{provider.type}</p>
            </div>
            <svg className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        ))}
      </div>

      <Link
        href="/providers"
        className="block text-center text-cyan-400 hover:text-cyan-300 text-sm font-medium"
      >
        View all providers →
      </Link>
    </div>
  )
}

// Compare Panel
export function ComparePanel() {
  const { showPanel } = useCommandCenter()

  const popularComparisons = [
    { providers: ['AT&T', 'Spectrum'], slugs: ['att-internet', 'spectrum'] },
    { providers: ['Xfinity', 'Verizon Fios'], slugs: ['xfinity', 'verizon-fios'] },
    { providers: ['T-Mobile', 'Starlink'], slugs: ['t-mobile', 'starlink'] },
    { providers: ['Google Fiber', 'AT&T'], slugs: ['google-fiber', 'att-internet'] },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Compare Providers</h2>
        <p className="text-gray-400">Side-by-side comparison of internet providers</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Popular Comparisons</h3>
        {popularComparisons.map((comp, index) => (
          <motion.button
            key={comp.providers.join('-')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => showPanel('comparison', { providers: comp.providers })}
            className="w-full p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-cyan-500/30 rounded-xl transition-all text-center group"
          >
            <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">
              {comp.providers[0]} <span className="text-gray-500">vs</span> {comp.providers[1]}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Ask the AI to compare any providers you&apos;re interested in</p>
      </div>
    </div>
  )
}

// Deals Panel
export function DealsPanel() {
  const deals = [
    { provider: 'AT&T', deal: 'First year at $55/mo', type: 'New Customer' },
    { provider: 'Spectrum', deal: 'Free installation', type: 'Limited Time' },
    { provider: 'Xfinity', deal: '$200 Visa gift card', type: 'Online Only' },
    { provider: 'T-Mobile', deal: '50% off for 12 months', type: 'Switch & Save' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Current Deals</h2>
        <p className="text-gray-400">Latest promotions from top providers</p>
      </div>

      <div className="space-y-3">
        {deals.map((deal, index) => (
          <motion.div
            key={deal.provider}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gradient-to-r from-gray-800/80 to-gray-800/40 border border-gray-700/50 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">{deal.provider}</span>
              <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">
                {deal.type}
              </span>
            </div>
            <p className="text-gray-300">{deal.deal}</p>
          </motion.div>
        ))}
      </div>

      <p className="text-sm text-gray-500 text-center">
        Deals updated weekly. Ask the AI for the latest offers in your area.
      </p>
    </div>
  )
}

// State Panel - shows providers in a state
export function StatePanel({ data }: { data?: { state?: string; stateSlug?: string } }) {
  const stateName = data?.state || 'Your State'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Internet in {stateName}</h2>
        <p className="text-gray-400">Find providers available in {stateName}</p>
      </div>

      <div className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
        <p className="text-gray-300">
          Enter your ZIP code in the chat to see providers available at your specific location in {stateName}.
        </p>
      </div>
    </div>
  )
}

// City Panel - shows providers in a city
export function CityPanel({ data }: { data?: { city?: string; state?: string; zipCode?: string } }) {
  const { showPanel, context } = useCommandCenter()
  const cityName = data?.city || 'Your City'
  const stateName = data?.state || ''
  const zipCode = data?.zipCode || context.zipCode

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Internet in {cityName}{stateName ? `, ${stateName}` : ''}
        </h2>
        <p className="text-gray-400">Compare providers available in your area</p>
      </div>

      {zipCode ? (
        <button
          onClick={() => showPanel('recommendations', { zipCode })}
          className="w-full p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-center hover:border-cyan-400 transition-colors"
        >
          <span className="text-cyan-400 font-medium">View providers in {zipCode} →</span>
        </button>
      ) : (
        <div className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
          <p className="text-gray-300">
            Enter your ZIP code in the chat to see providers available in {cityName}.
          </p>
        </div>
      )}
    </div>
  )
}
