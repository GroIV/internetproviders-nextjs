import { Metadata } from 'next'
import { AddressAvailability } from '@/components/AddressAvailability'

export const metadata: Metadata = {
  title: 'Check Internet Availability at Your Address | Internet Providers AI',
  description: 'Enter your street address to see which internet providers offer service at your location, with real speeds from FCC data.',
}

export default function CheckAvailabilityPage() {
  return (
    <main className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Check Internet Availability
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Enter your address to see exactly which providers offer service at your location,
            with real speed data from the FCC.
          </p>
        </div>

        {/* Main Component */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <AddressAvailability showTitle={false} />
        </div>

        {/* Info Section */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Official FCC Data</h3>
            <p className="text-sm text-gray-400">
              Real availability data from the FCC Broadband Data Collection, updated June 2025.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Actual Speeds</h3>
            <p className="text-sm text-gray-400">
              See maximum advertised download and upload speeds reported by each provider.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Location-Precise</h3>
            <p className="text-sm text-gray-400">
              Results based on your exact address, not just ZIP code or city-level estimates.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
