import { Metadata } from 'next'
import Link from 'next/link'
import { stateList } from '@/data/states'
import { ZipSearch } from '@/components/ZipSearch'

export const metadata: Metadata = {
  title: 'Internet Providers by State | Find ISPs in Your Area',
  description: 'Browse internet service providers by state. Compare fiber, cable, and wireless internet options available in all 50 US states.',
  alternates: {
    canonical: '/internet',
  },
}

export default function InternetByStatePage() {
  // Group states by region (using state-name slugs)
  const regions = {
    'Northeast': ['connecticut', 'maine', 'massachusetts', 'new-hampshire', 'new-jersey', 'new-york', 'pennsylvania', 'rhode-island', 'vermont'],
    'Southeast': ['alabama', 'arkansas', 'florida', 'georgia', 'kentucky', 'louisiana', 'maryland', 'mississippi', 'north-carolina', 'south-carolina', 'tennessee', 'virginia', 'west-virginia', 'district-of-columbia'],
    'Midwest': ['illinois', 'indiana', 'iowa', 'kansas', 'michigan', 'minnesota', 'missouri', 'nebraska', 'north-dakota', 'ohio', 'south-dakota', 'wisconsin'],
    'Southwest': ['arizona', 'new-mexico', 'oklahoma', 'texas'],
    'West': ['alaska', 'california', 'colorado', 'hawaii', 'idaho', 'montana', 'nevada', 'oregon', 'utah', 'washington', 'wyoming'],
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Internet by State</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text-ocean">
            Internet Providers by State
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Find and compare internet service providers in your state.
            Browse by region or search by ZIP code for specific availability.
          </p>
          <ZipSearch />
        </div>

        {/* Regions */}
        <div className="space-y-8 mb-12">
          {Object.entries(regions).map(([region, stateSlugs]) => (
            <div key={region} className="futuristic-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 gradient-text-fresh">{region}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {stateSlugs.map(slug => {
                  const state = stateList.find(s => s.slug === slug)
                  if (!state) return null
                  return (
                    <Link
                      key={slug}
                      href={`/internet/${slug}`}
                      className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
                    >
                      <span className="text-blue-400 font-semibold">{state.code}</span>
                      <span className="text-gray-300 text-sm group-hover:text-white truncate">{state.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* All States Grid */}
        <div className="futuristic-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 gradient-text-ocean">All States</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {stateList.map(state => (
              <Link
                key={state.slug}
                href={`/internet/${state.slug}`}
                className="px-3 py-2 bg-gray-800 text-gray-300 rounded text-sm hover:bg-blue-600 hover:text-white transition-colors text-center"
              >
                {state.code}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
