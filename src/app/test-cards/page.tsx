'use client'

import { useState } from 'react'
import { ProviderLogo } from '@/components/ProviderLogo'

// Sample provider data
const sampleProviders = [
  { name: 'AT&T Internet', slug: 'att-internet', tech: 'Fiber', price: 55, speed: 5000, coverage: 68 },
  { name: 'Spectrum', slug: 'spectrum', tech: 'Cable', price: 50, speed: 1000, coverage: 72 },
  { name: 'Google Fiber', slug: 'google-fiber', tech: 'Fiber', price: 70, speed: 8000, coverage: 15 },
  { name: 'T-Mobile', slug: 't-mobile', tech: '5G', price: 50, speed: 245, coverage: 45 },
  { name: 'Xfinity', slug: 'xfinity', tech: 'Cable', price: 30, speed: 2000, coverage: 55 },
  { name: 'Verizon Fios', slug: 'verizon-fios', tech: 'Fiber', price: 50, speed: 2300, coverage: 22 },
]

const techColors: Record<string, string> = {
  'Fiber': 'from-green-400 to-emerald-500',
  'Cable': 'from-blue-400 to-cyan-500',
  '5G': 'from-purple-400 to-pink-500',
}

function formatSpeed(mbps: number): string {
  return mbps >= 1000 ? `${(mbps / 1000).toFixed(mbps % 1000 === 0 ? 0 : 1)} Gbps` : `${mbps} Mbps`
}

// Option A: Large centered logo, stacked info
function CardOptionA({ provider }: { provider: typeof sampleProviders[0] }) {
  return (
    <div className="group p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 hover:bg-gray-800 transition-all cursor-pointer">
      <div className="flex justify-center mb-3">
        <ProviderLogo slug={provider.slug} name={provider.name} size="md" />
      </div>
      <div className="text-center mb-3">
        <div className="text-sm font-semibold text-white mb-1">{provider.name}</div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r ${techColors[provider.tech]} text-white`}>
          {provider.tech}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg text-green-400 font-bold">${provider.price}</span>
          <span className="text-xs text-gray-400">/mo</span>
        </div>
        <span className="text-sm text-cyan-400">{formatSpeed(provider.speed)}</span>
      </div>
      <button className="w-full mt-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg">
        Order
      </button>
    </div>
  )
}

// Option B: Horizontal with large logo left
function CardOptionB({ provider }: { provider: typeof sampleProviders[0] }) {
  return (
    <div className="group flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 hover:bg-gray-800 transition-all cursor-pointer">
      <ProviderLogo slug={provider.slug} name={provider.name} size="md" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white">{provider.name}</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium bg-gradient-to-r ${techColors[provider.tech]} text-white`}>
            {provider.tech}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg text-green-400 font-bold">${provider.price}<span className="text-xs text-gray-400">/mo</span></span>
          <span className="text-sm text-cyan-400">{formatSpeed(provider.speed)}</span>
        </div>
      </div>
      <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg">
        Order
      </button>
    </div>
  )
}

// Option C: Compact with logo top-left, info beside
function CardOptionC({ provider }: { provider: typeof sampleProviders[0] }) {
  return (
    <div className="group p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 hover:bg-gray-800 transition-all cursor-pointer">
      <div className="flex items-start gap-3 mb-2">
        <ProviderLogo slug={provider.slug} name={provider.name} size="sm" />
        <div className="flex-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{provider.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium bg-gradient-to-r ${techColors[provider.tech]} text-white`}>
              {provider.tech}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{provider.coverage}% coverage</div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
        <div className="flex items-center gap-3">
          <span className="text-base text-green-400 font-bold">${provider.price}</span>
          <span className="text-xs text-cyan-400">{formatSpeed(provider.speed)}</span>
        </div>
        <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg">
          Order
        </button>
      </div>
    </div>
  )
}

// Option D: Full-width logo banner style
function CardOptionD({ provider }: { provider: typeof sampleProviders[0] }) {
  return (
    <div className="group bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 hover:bg-gray-800 transition-all cursor-pointer overflow-hidden">
      <div className="bg-gray-900/50 p-4 flex justify-center">
        <ProviderLogo slug={provider.slug} name={provider.name} size="lg" />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">{provider.name}</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium bg-gradient-to-r ${techColors[provider.tech]} text-white`}>
            {provider.tech}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl text-green-400 font-bold">${provider.price}</span>
            <span className="text-xs text-gray-400">/mo</span>
          </div>
          <span className="text-sm text-cyan-400 font-medium">{formatSpeed(provider.speed)}</span>
        </div>
        <button className="w-full mt-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg">
          Order Now
        </button>
      </div>
    </div>
  )
}

// Option E: Minimal with emphasis on price/speed
function CardOptionE({ provider }: { provider: typeof sampleProviders[0] }) {
  return (
    <div className="group p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 hover:bg-gray-800 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <ProviderLogo slug={provider.slug} name={provider.name} size="sm" />
        <span className={`px-2 py-1 rounded text-[10px] font-medium bg-gradient-to-r ${techColors[provider.tech]} text-white`}>
          {provider.tech}
        </span>
      </div>
      <div className="text-center mb-4">
        <div className="text-3xl text-green-400 font-bold">${provider.price}</div>
        <div className="text-sm text-gray-400">per month</div>
        <div className="text-lg text-cyan-400 font-semibold mt-1">{formatSpeed(provider.speed)}</div>
      </div>
      <button className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg">
        Get {provider.name}
      </button>
    </div>
  )
}

// Option F: Side-by-side with large logo
function CardOptionF({ provider }: { provider: typeof sampleProviders[0] }) {
  return (
    <div className="group flex gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 hover:bg-gray-800 transition-all cursor-pointer">
      <div className="flex-shrink-0 flex items-center justify-center w-28 h-20 bg-gray-900/50 rounded-lg">
        <ProviderLogo slug={provider.slug} name={provider.name} size="md" />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-white">{provider.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium bg-gradient-to-r ${techColors[provider.tech]} text-white`}>
              {provider.tech}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xl text-green-400 font-bold">${provider.price}<span className="text-sm text-gray-400">/mo</span></span>
            <span className="text-sm text-cyan-400">{formatSpeed(provider.speed)}</span>
          </div>
        </div>
        <button className="self-start px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg mt-2">
          Order
        </button>
      </div>
    </div>
  )
}

// Option G: Card with prominent CTA
function CardOptionG({ provider }: { provider: typeof sampleProviders[0] }) {
  return (
    <div className="group relative p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700/50 hover:border-cyan-500/40 transition-all cursor-pointer">
      <div className="absolute top-3 right-3">
        <span className={`px-2 py-1 rounded-full text-[9px] font-medium bg-gradient-to-r ${techColors[provider.tech]} text-white`}>
          {provider.tech}
        </span>
      </div>
      <div className="flex justify-center mb-3">
        <ProviderLogo slug={provider.slug} name={provider.name} size="lg" />
      </div>
      <div className="text-center">
        <div className="text-base font-semibold text-white mb-2">{provider.name}</div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div>
            <div className="text-2xl text-green-400 font-bold">${provider.price}</div>
            <div className="text-[10px] text-gray-500 uppercase">per month</div>
          </div>
          <div className="w-px h-10 bg-gray-700" />
          <div>
            <div className="text-2xl text-cyan-400 font-bold">{formatSpeed(provider.speed)}</div>
            <div className="text-[10px] text-gray-500 uppercase">max speed</div>
          </div>
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all">
          Order Now
        </button>
      </div>
    </div>
  )
}

// Option H: Ultra-compact list style
function CardOptionH({ provider }: { provider: typeof sampleProviders[0] }) {
  return (
    <div className="group flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 hover:bg-gray-800 transition-all cursor-pointer">
      <div className="w-14 h-9 flex items-center justify-center bg-gray-900/50 rounded">
        <ProviderLogo slug={provider.slug} name={provider.name} size="xs" className="!w-12 !h-8" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{provider.name}</span>
          <span className={`px-1 py-0.5 rounded text-[8px] font-medium bg-gradient-to-r ${techColors[provider.tech]} text-white`}>
            {provider.tech}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm text-green-400 font-bold">${provider.price}</span>
          <span className="text-[10px] text-gray-400">•</span>
          <span className="text-xs text-cyan-400">{formatSpeed(provider.speed)}</span>
        </div>
      </div>
      <button className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-semibold rounded">
        Order
      </button>
    </div>
  )
}

export default function TestCardsPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const options = [
    { id: 'A', name: 'Large Centered Logo', component: CardOptionA, cols: 2 },
    { id: 'B', name: 'Horizontal Large Logo', component: CardOptionB, cols: 1 },
    { id: 'C', name: 'Compact Logo Top-Left', component: CardOptionC, cols: 2 },
    { id: 'D', name: 'Banner Style', component: CardOptionD, cols: 2 },
    { id: 'E', name: 'Price Emphasis', component: CardOptionE, cols: 2 },
    { id: 'F', name: 'Side-by-Side', component: CardOptionF, cols: 1 },
    { id: 'G', name: 'Prominent CTA', component: CardOptionG, cols: 2 },
    { id: 'H', name: 'Ultra-Compact List', component: CardOptionH, cols: 1 },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Provider Card Options</h1>
        <p className="text-gray-400 mb-8">Click an option to select it. Each shows how it would look in the panel.</p>

        <div className="space-y-12">
          {options.map((option) => (
            <div
              key={option.id}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedOption === option.id
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => setSelectedOption(option.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold">
                    {option.id}
                  </span>
                  <h2 className="text-xl font-semibold">{option.name}</h2>
                </div>
                {selectedOption === option.id && (
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                    Selected
                  </span>
                )}
              </div>

              {/* Preview container matching panel width */}
              <div className="bg-gray-900/50 rounded-xl p-4 max-w-xl">
                <div className={option.cols === 2 ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                  {sampleProviders.slice(0, option.cols === 2 ? 6 : 4).map((provider) => (
                    <option.component key={provider.slug} provider={provider} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedOption && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl flex items-center gap-4">
            <span className="text-gray-400">Selected: <strong className="text-white">Option {selectedOption}</strong></span>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg">
              Apply This Design
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
