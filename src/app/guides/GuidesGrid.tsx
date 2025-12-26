'use client'

import { GuideCard } from '@/components/guides'

interface Guide {
  slug: string
  category: string
  title: string
  description: string
}

interface GuidesGridProps {
  guides: Guide[]
  zipCode?: string
  cityName?: string
}

export function GuidesGrid({ guides, zipCode, cityName }: GuidesGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {guides.map((guide, index) => {
        // Personalize title for location
        const personalizedTitle = cityName
          ? `${guide.title} in ${cityName}`
          : guide.title

        const personalizedDescription = cityName
          ? guide.description.replace('your area', cityName)
          : guide.description

        return (
          <GuideCard
            key={guide.slug}
            slug={guide.slug}
            title={personalizedTitle}
            description={personalizedDescription}
            category={guide.category}
            zipCode={zipCode}
            index={index}
          />
        )
      })}
    </div>
  )
}
