import { Metadata } from 'next'
import Link from 'next/link'
import { FeaturedPlansDisplay } from '@/components/plans'

export const metadata: Metadata = {
  title: 'Featured Internet Plans | Compare Pricing & Speeds',
  description: 'Compare featured internet plans from top providers. Find the best value fiber, cable, and 5G plans with verified FCC pricing data.',
  alternates: {
    canonical: '/plans',
  },
  openGraph: {
    title: 'Featured Internet Plans - InternetProviders.ai',
    description: 'Compare featured internet plans from Frontier, AT&T, Spectrum, and T-Mobile with verified pricing.',
  }
}

export default function PlansPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="holographic">Featured</span>{' '}
            <span className="text-white">Internet Plans</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Curated picks from top providers with verified FCC pricing.
            Compare speeds, features, and find the best value for your needs.
          </p>

          {/* Quick stats */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 neon-text-subtle">4</div>
              <div className="text-sm text-gray-500">Providers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 neon-text-subtle">12</div>
              <div className="text-sm text-gray-500">Featured Plans</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 neon-text-subtle">$40</div>
              <div className="text-sm text-gray-500">Starting Price</div>
            </div>
          </div>
        </div>

        {/* Plans display */}
        <FeaturedPlansDisplay showFilters={true} />

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block futuristic-card corner-accent rounded-2xl p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-3">
              Not sure which plan is right for you?
            </h2>
            <p className="text-gray-400 mb-6">
              Our AI assistant can help you find the perfect plan based on your usage,
              location, and budget.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 glow-button text-white font-semibold py-3 px-6 rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with AI Advisor
            </Link>
          </div>
        </div>

        {/* Data source attribution */}
        <div className="mt-12 text-center text-xs text-gray-500">
          <p>
            Pricing data sourced from FCC Broadband Consumer Labels.
            Actual prices may vary by location.
          </p>
        </div>
      </div>
    </div>
  )
}
