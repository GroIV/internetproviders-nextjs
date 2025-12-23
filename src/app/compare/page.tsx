import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { ZipSearch } from '@/components/ZipSearch'
import { ProviderCard } from '@/components/ProviderCard'

export const metadata: Metadata = {
  title: 'Compare Internet Providers',
  description: 'Compare internet providers in your area. Enter your ZIP code to see available options, speeds, and pricing.',
}

interface Provider {
  id: number
  name: string
  slug: string
  category: string
  technologies: string[]
  logo: string | null
}

async function getProvidersByZip(zipCode: string): Promise<{ providers: Provider[]; zipCode: string } | null> {
  if (!zipCode || !/^\d{5}$/.test(zipCode)) {
    return null
  }

  const supabase = createAdminClient()

  // Get coverage for this ZIP
  const { data: coverageData } = await supabase
    .from('coverage')
    .select('provider_id')
    .eq('zip_code', zipCode)
    .eq('has_service', true)

  if (!coverageData || coverageData.length === 0) {
    return { providers: [], zipCode }
  }

  const providerIds = [...new Set(coverageData.map(c => c.provider_id))]

  // Get provider details
  const { data: providers } = await supabase
    .from('providers')
    .select('*')
    .in('id', providerIds)

  return {
    providers: providers || [],
    zipCode
  }
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ zip?: string }>
}) {
  const params = await searchParams
  const zipCode = params.zip || ''
  const result = await getProvidersByZip(zipCode)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {zipCode ? `Internet Providers in ${zipCode}` : 'Compare Internet Providers'}
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            {zipCode
              ? `Find the best internet deals available at your address`
              : `Enter your ZIP code to see available providers and plans`}
          </p>

          <ZipSearch />
        </div>

        {/* Results */}
        {result && (
          <div className="mt-12">
            {result.providers.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">
                    {result.providers.length} Provider{result.providers.length !== 1 ? 's' : ''} Available
                  </h2>
                  <span className="text-gray-400">ZIP: {result.zipCode}</span>
                </div>

                <div className="grid gap-6">
                  {result.providers.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} zipCode={result.zipCode} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
                <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold mb-2">No Providers Found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  We couldn't find any internet providers for ZIP code {result.zipCode}.
                  This might be a rural area with limited coverage.
                </p>
              </div>
            )}
          </div>
        )}

        {/* No search yet */}
        {!result && !zipCode && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <div className="text-3xl mb-3">1</div>
              <h3 className="font-semibold mb-2">Enter Your ZIP</h3>
              <p className="text-sm text-gray-400">Type your 5-digit ZIP code to start</p>
            </div>
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <div className="text-3xl mb-3">2</div>
              <h3 className="font-semibold mb-2">Compare Options</h3>
              <p className="text-sm text-gray-400">See all available providers and plans</p>
            </div>
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
              <div className="text-3xl mb-3">3</div>
              <h3 className="font-semibold mb-2">Choose & Save</h3>
              <p className="text-sm text-gray-400">Pick the best deal for your needs</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
