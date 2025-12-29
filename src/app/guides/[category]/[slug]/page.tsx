import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getContentByPath, getAllContentPaths } from '@/lib/getContent'
import { JsonLd } from '@/lib/seo'
import { AnimatedArticle, AnimatedFooter } from '@/components/content/AnimatedContentWrapper'
import { AuroraBlobs } from '@/components/effects/AuroraBlobs'
import { CircuitPattern } from '@/components/effects/CircuitPattern'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

// Valid guide categories
const VALID_CATEGORIES = ['technology', 'how-to', 'best-of', 'education', 'choosing', 'setup'] as const
type GuideCategory = typeof VALID_CATEGORIES[number]

const CATEGORY_LABELS: Record<GuideCategory, string> = {
  'technology': 'Technology Guides',
  'how-to': 'How-To Guides',
  'best-of': 'Best Of Guides',
  'education': 'Education',
  'choosing': 'Choosing Guides',
  'setup': 'Setup & Installation',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const path = `/guides/${category}/${slug}`
  const content = await getContentByPath(path)

  if (!content) {
    return {
      title: 'Guide Not Found',
    }
  }

  const { metadata } = content

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    authors: metadata.author ? [{ name: metadata.author }] : undefined,
    alternates: {
      canonical: content.canonical_url,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: content.canonical_url,
      type: 'article',
      publishedTime: content.published_at || undefined,
      modifiedTime: content.updated_at || undefined,
      images: metadata.image ? [metadata.image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
    },
  }
}

export async function generateStaticParams() {
  const paths = await getAllContentPaths('guide')

  return paths
    .filter(path => path.startsWith('/guides/'))
    .map(path => {
      const parts = path.split('/')
      // /guides/category/slug
      if (parts.length >= 4) {
        return {
          category: parts[2],
          slug: parts[3],
        }
      }
      return null
    })
    .filter(Boolean) as { category: string; slug: string }[]
}

export default async function GuideCategoryPage({ params }: Props) {
  const { category, slug } = await params

  // Validate category
  if (!VALID_CATEGORIES.includes(category as GuideCategory)) {
    notFound()
  }

  const path = `/guides/${category}/${slug}`
  const content = await getContentByPath(path)

  if (!content) {
    notFound()
  }

  const { metadata, html } = content
  const categoryLabel = CATEGORY_LABELS[category as GuideCategory]

  // Build JSON-LD schema
  const articleSchema = metadata.jsonLd || {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: metadata.title,
    description: metadata.description,
    url: content.canonical_url,
    datePublished: content.published_at,
    dateModified: content.updated_at || content.published_at,
    author: {
      '@type': 'Organization',
      name: 'InternetProviders.ai',
    },
    publisher: {
      '@type': 'Organization',
      name: 'InternetProviders.ai',
      url: 'https://www.internetproviders.ai',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.internetproviders.ai',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Guides',
        item: 'https://www.internetproviders.ai/guides',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryLabel,
        item: `https://www.internetproviders.ai/guides/${category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: metadata.title,
        item: content.canonical_url,
      },
    ],
  }

  return (
    <>
      <JsonLd data={[articleSchema, breadcrumbSchema]} />

      {/* Animated backgrounds */}
      <AuroraBlobs opacity={0.08} />
      <CircuitPattern opacity={0.04} animated={true} />

      <div className="min-h-screen relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="ipai-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="ipai-breadcrumb__separator">/</span>
              <Link href="/guides">Guides</Link>
              <span className="ipai-breadcrumb__separator">/</span>
              <Link href={`/guides?category=${category}`}>{categoryLabel}</Link>
              <span className="ipai-breadcrumb__separator">/</span>
              <span className="ipai-breadcrumb__current">{metadata.title}</span>
            </nav>

            {/* Content with scroll-triggered animation */}
            <AnimatedArticle html={html} />

            {/* Back to guides with fade-in animation */}
            <AnimatedFooter>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to All Guides
              </Link>
            </AnimatedFooter>
          </div>
        </div>
      </div>
    </>
  )
}
