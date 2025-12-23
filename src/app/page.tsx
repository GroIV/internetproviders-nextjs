import { ZipSearch } from '@/components/ZipSearch'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-gray-950 to-cyan-900/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
              Find the Best Internet Provider in Your Area
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Compare speeds, prices, and reviews from top internet service providers.
              Get the perfect plan for streaming, gaming, or working from home.
            </p>

            <ZipSearch />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-400">90K+</div>
              <div className="text-sm text-gray-400 mt-1">ZIP Codes Covered</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-cyan-400">50+</div>
              <div className="text-sm text-gray-400 mt-1">Internet Providers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-400">5K+</div>
              <div className="text-sm text-gray-400 mt-1">Guides & Articles</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-cyan-400">1M+</div>
              <div className="text-sm text-gray-400 mt-1">Monthly Visitors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How We Help You Find the Right Internet</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Search by ZIP Code</h3>
              <p className="text-gray-400">Enter your ZIP code to see all available internet providers, plans, and prices in your exact location.</p>
            </div>

            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <div className="w-12 h-12 rounded-lg bg-cyan-600/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compare Plans</h3>
              <p className="text-gray-400">Side-by-side comparison of speeds, prices, contracts, and features to find your perfect match.</p>
            </div>

            <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Read Reviews</h3>
              <p className="text-gray-400">Real customer reviews and ratings help you make an informed decision about your internet service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/50 to-cyan-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Better Internet?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join millions of users who have found their perfect internet plan through InternetProviders.ai
          </p>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}
