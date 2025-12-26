import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About InternetProviders.ai | Our Mission',
  description: 'Learn about InternetProviders.ai, your trusted resource for comparing internet service providers and finding the best deals in your area.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">About</span>
        </nav>

        <h1 className="text-4xl font-bold mb-8 gradient-text-ocean">About InternetProviders.ai</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-gray-300 mb-8">
            InternetProviders.ai is your comprehensive resource for finding and comparing
            internet service providers across the United States. We help millions of consumers
            make informed decisions about their home internet service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 gradient-text-fresh">Our Mission</h2>
          <p className="text-gray-300 mb-6">
            We believe everyone deserves access to reliable, affordable internet. Our mission
            is to simplify the process of finding and comparing internet providers by providing
            accurate, up-to-date information about pricing, speeds, and availability.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">What We Offer</h2>
          <ul className="space-y-4 text-gray-300 mb-6">
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>ZIP Code Search:</strong> Find all internet providers available at your specific address</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Plan Comparisons:</strong> Compare speeds, prices, and features side-by-side</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Current Deals:</strong> Stay updated on the latest promotions and discounts</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span><strong>Expert Guides:</strong> Educational content to help you choose the right internet plan</span>
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Data</h2>
          <p className="text-gray-300 mb-6">
            We source our coverage data from the FCC Broadband Data Collection (BDC), which
            provides the most comprehensive and accurate information about internet service
            availability across the United States. We combine this with real-time pricing
            information from providers to give you the complete picture.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-300 mb-6">
            Have questions, suggestions, or feedback? We'd love to hear from you.
            Visit our <Link href="/contact" className="text-blue-400 hover:underline">contact page</Link> to
            get in touch with our team.
          </p>
        </div>
      </div>
    </div>
  )
}
