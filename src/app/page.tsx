import { Metadata } from 'next'
import { HomePageContent } from '@/components/HomePageContent'

export const metadata: Metadata = {
  title: 'Find Internet Providers - AI-Powered Search | InternetProviders.ai',
  description: 'Find the best internet provider for your address. AI-powered recommendations, real FCC data, and instant comparisons. Enter your ZIP code to get started.',
  openGraph: {
    title: 'Find Internet Providers - AI-Powered Search',
    description: 'AI-powered internet provider recommendations based on your location. Compare plans, prices, and speeds instantly.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Internet Providers - AI-Powered Search',
    description: 'AI-powered internet provider recommendations based on your location.',
  },
}

export default function HomePage() {
  return <HomePageContent />
}
