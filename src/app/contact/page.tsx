import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Us | InternetProviders.ai',
  description: 'Get in touch with the InternetProviders.ai team. We\'re here to help with questions about internet providers, our service, or partnership opportunities.',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Contact</span>
        </nav>

        <h1 className="text-4xl font-bold mb-8 gradient-text-ocean">Contact Us</h1>

        <p className="text-xl text-gray-300 mb-8">
          Have questions or feedback? We'd love to hear from you. Choose the best way
          to reach us below.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="futuristic-card corner-accent rounded-xl p-6 glow-burst-hover">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Email</h2>
            <p className="text-gray-400 mb-4">For general inquiries and support</p>
            <a href="mailto:support@internetproviders.ai" className="text-blue-400 hover:underline">
              support@internetproviders.ai
            </a>
          </div>

          <div className="futuristic-card corner-accent rounded-xl p-6 glow-burst-emerald">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Partnerships</h2>
            <p className="text-gray-400 mb-4">For business and partnership inquiries</p>
            <a href="mailto:partners@internetproviders.ai" className="text-green-400 hover:underline">
              partners@internetproviders.ai
            </a>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How do you get your data?</h3>
              <p className="text-gray-400">
                Our coverage data comes from the FCC Broadband Data Collection (BDC), which is
                updated regularly by internet service providers. Pricing information is gathered
                directly from provider websites.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is your service free?</h3>
              <p className="text-gray-400">
                Yes! InternetProviders.ai is completely free to use. We earn revenue through
                affiliate partnerships with internet providers when you sign up through our links.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How often is the data updated?</h3>
              <p className="text-gray-400">
                We update our coverage data whenever the FCC releases new BDC data (typically
                twice per year). Pricing and promotions are updated more frequently as providers
                change their offers.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Looking for something else?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/about" className="text-blue-400 hover:underline">About Us</Link>
            <span className="text-gray-600">•</span>
            <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
            <span className="text-gray-600">•</span>
            <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
