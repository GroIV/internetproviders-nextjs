import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { ProvidersPageClient } from '@/components/providers'

export const metadata: Metadata = {
  title: 'Internet Providers',
  description: 'Browse all internet service providers. Compare fiber, cable, DSL, and satellite providers nationwide.',
  alternates: {
    canonical: '/providers',
  },
}

async function getProviders() {
  const supabase = createAdminClient()

  const { data: providers, error } = await supabase
    .from('providers')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching providers:', error)
    return []
  }

  return providers || []
}

export default async function ProvidersPage() {
  const providers = await getProviders()

  return <ProvidersPageClient allProviders={providers} />
}
