/**
 * SEO utilities for structured data (JSON-LD schemas)
 */

const SITE_URL = 'https://www.internetproviders.ai'
const SITE_NAME = 'InternetProviders.ai'

// Organization Schema - used site-wide
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Compare internet providers in your area. Find the best deals on fiber, cable, DSL, and 5G internet service.',
    sameAs: [
      // Add social media URLs when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${SITE_URL}/contact`,
    },
  }
}

// WebSite Schema with SearchAction
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/compare?zip={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// Breadcrumb Schema
export interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

// Provider/Service Schema
export interface ProviderSchemaInput {
  name: string
  slug: string
  description: string
  technologies: string[]
  category: string
  priceRange?: string
  areaServed?: string
}

export function generateProviderSchema(provider: ProviderSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Internet Service Provider',
    name: `${provider.name} Internet Service`,
    description: provider.description,
    provider: {
      '@type': 'Organization',
      name: provider.name,
      url: `${SITE_URL}/providers/${provider.slug}`,
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${provider.name} Internet Plans`,
      itemListElement: provider.technologies.map((tech) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: `${provider.name} ${tech} Internet`,
          description: `${tech} internet service from ${provider.name}`,
        },
      })),
    },
  }
}

// Internet Service Offer Schema
export interface InternetOfferInput {
  providerName: string
  planName: string
  price: number
  speed: string
  technology: string
  url: string
}

export function generateOfferSchema(offer: InternetOfferInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: offer.planName,
    description: `${offer.speed} ${offer.technology} internet from ${offer.providerName}`,
    price: offer.price,
    priceCurrency: 'USD',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: offer.price,
      priceCurrency: 'USD',
      unitCode: 'MON',
      unitText: 'month',
    },
    seller: {
      '@type': 'Organization',
      name: offer.providerName,
    },
    url: offer.url,
  }
}

// FAQ Schema
export interface FAQItem {
  question: string
  answer: string
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// LocalBusiness Schema for location pages
export interface LocalBusinessInput {
  city: string
  state: string
  stateName: string
}

export function generateLocalBusinessSchema(location: LocalBusinessInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Internet Providers in ${location.city}, ${location.stateName}`,
    description: `Compare internet service providers in ${location.city}, ${location.stateName}. Find the best fiber, cable, and 5G internet options.`,
    url: `${SITE_URL}/internet/${location.state}/${location.city.toLowerCase().replace(/\s+/g, '-')}`,
    about: {
      '@type': 'City',
      name: location.city,
      containedInPlace: {
        '@type': 'State',
        name: location.stateName,
      },
    },
  }
}

// Article/Guide Schema
export interface ArticleSchemaInput {
  title: string
  description: string
  slug: string
  datePublished?: string
  dateModified?: string
  author?: string
}

export function generateArticleSchema(article: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}/guides/${article.slug}`,
    datePublished: article.datePublished || new Date().toISOString(),
    dateModified: article.dateModified || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

// Comparison/ItemList Schema for ranking pages
export interface RankingItem {
  name: string
  position: number
  url: string
}

export function generateRankingSchema(
  title: string,
  description: string,
  items: RankingItem[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description: description,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

// Component to render JSON-LD script tag
export function JsonLd({ data }: { data: object | object[] }) {
  const schemas = Array.isArray(data) ? data : [data]

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

// Canonical URL generator
export function getCanonicalUrl(path: string): string {
  // Remove trailing slashes and query params for canonical
  const cleanPath = path.split('?')[0].replace(/\/+$/, '')
  return `${SITE_URL}${cleanPath || '/'}`
}

// Generate metadata with canonical URL
export function generateMetadataWithCanonical(
  title: string,
  description: string,
  path: string,
  additionalMetadata?: Record<string, unknown>
) {
  const canonical = getCanonicalUrl(path)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    ...additionalMetadata,
  }
}
