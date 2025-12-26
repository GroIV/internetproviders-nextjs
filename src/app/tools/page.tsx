import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Internet Tools',
  description: 'Free internet tools: speed test, ISP recommendation quiz, and AI-powered assistant to help find the best internet provider.',
}

const tools = [
  {
    id: 'speed-test',
    name: 'Speed Test',
    description: 'Test your current internet download and upload speeds, plus latency.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    href: '/tools/speed-test',
    color: 'from-yellow-600 to-orange-600',
  },
  {
    id: 'quiz',
    name: 'Find Your Perfect ISP',
    description: 'Answer a few questions and get personalized internet provider recommendations.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    href: '/tools/quiz',
    color: 'from-green-600 to-emerald-600',
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Chat with our AI to get answers about internet providers, plans, and technology.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    href: '/tools/ai-assistant',
    color: 'from-blue-600 to-cyan-600',
  },
]

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text-rainbow">Internet Tools</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Free tools to help you test, compare, and choose the best internet service
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group futuristic-card corner-accent rounded-xl p-6 transition-all hover:scale-[1.02] glow-burst-hover"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {tool.icon}
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h2>
              <p className="text-gray-400 text-sm">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 futuristic-card rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-center gradient-text-fresh">Why Use Our Tools?</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-lg bg-gray-800/30 glow-burst-emerald">
              <div className="text-3xl mb-2 gradient-text-fresh">100%</div>
              <div className="text-gray-400">Free to Use</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/30 glow-burst-hover">
              <div className="text-3xl mb-2 gradient-text-ocean">No Sign-up</div>
              <div className="text-gray-400">Required</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/30 glow-burst-orange">
              <div className="text-3xl mb-2 gradient-text-sunset">Instant</div>
              <div className="text-gray-400">Results</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
