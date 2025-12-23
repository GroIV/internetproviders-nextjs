import { Metadata } from 'next'
import Link from 'next/link'
import { RelatedRankings } from '@/components/RelatedRankings'

export const metadata: Metadata = {
  title: 'Internet Provider FAQ | Common Questions Answered',
  description: 'Get answers to frequently asked questions about internet service providers, speeds, pricing, and choosing the right plan for your needs.',
}

interface FAQItem {
  question: string
  answer: string | React.ReactNode
}

interface FAQCategory {
  name: string
  icon: React.ReactNode
  items: FAQItem[]
}

const faqData: FAQCategory[] = [
  {
    name: 'General',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    items: [
      {
        question: 'How do I find internet providers in my area?',
        answer: (
          <>
            Enter your ZIP code on our <Link href="/compare" className="text-blue-400 hover:text-blue-300">Compare page</Link> to see all available providers at your address. You can also browse by state on our <Link href="/internet" className="text-blue-400 hover:text-blue-300">Internet by State</Link> directory.
          </>
        ),
      },
      {
        question: 'What types of internet connections are available?',
        answer: (
          <>
            The main types are <Link href="/best/fiber-providers" className="text-blue-400 hover:text-blue-300">Fiber</Link>, <Link href="/best/cable-providers" className="text-blue-400 hover:text-blue-300">Cable</Link>, DSL, Fixed Wireless, 5G Home Internet, and Satellite. Fiber offers the fastest speeds with lowest latency, while satellite is available almost everywhere but has higher latency.
          </>
        ),
      },
      {
        question: 'How does InternetProviders.ai make money?',
        answer: 'We may receive compensation when you click on links to providers and sign up for service. This helps us keep our comparison tools free. Our rankings and recommendations are based on actual coverage data and user needs, not affiliate relationships.',
      },
      {
        question: 'Is your coverage data accurate?',
        answer: 'We use FCC broadband data and provider-reported coverage information to determine availability. However, actual availability can vary by address. We recommend verifying directly with the provider before signing up.',
      },
    ],
  },
  {
    name: 'Internet Speeds',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    items: [
      {
        question: 'What internet speed do I need?',
        answer: (
          <>
            It depends on your usage. For basic browsing and email, 25 Mbps is sufficient. For streaming 4K video, 50-100 Mbps works well. For gaming or multiple users, consider 200-500 Mbps. Large households or content creators may want gigabit speeds. Try our <Link href="/tools/quiz" className="text-blue-400 hover:text-blue-300">Speed Quiz</Link> to get a personalized recommendation.
          </>
        ),
      },
      {
        question: 'What is the difference between download and upload speed?',
        answer: 'Download speed affects how fast you can receive data (streaming, browsing, downloading files). Upload speed affects how fast you can send data (video calls, uploading files, live streaming). Most activities rely more on download speed, but remote workers and content creators need good upload speeds too.',
      },
      {
        question: 'Why is my internet slower than advertised?',
        answer: (
          <>
            Several factors can affect speed: Wi-Fi interference, router placement, network congestion during peak hours, or older equipment. Run a <Link href="/tools/speed-test" className="text-blue-400 hover:text-blue-300">Speed Test</Link> to check your actual speeds. If consistently slow, contact your provider or consider upgrading your router.
          </>
        ),
      },
      {
        question: 'What is latency and why does it matter?',
        answer: 'Latency (or ping) measures the delay in data transmission, measured in milliseconds (ms). Low latency is crucial for gaming, video calls, and real-time applications. Fiber typically has the lowest latency (5-15ms), while satellite can have latency of 500ms+.',
      },
      {
        question: 'Do I really need gigabit internet?',
        answer: (
          <>
            For most households, no. Gigabit (1 Gbps) is overkill for typical usage. 200-500 Mbps handles most families comfortably. However, gigabit makes sense for 10+ simultaneous users, frequent large file transfers, or if you want to future-proof. See our <Link href="/fastest/providers" className="text-blue-400 hover:text-blue-300">Fastest Providers</Link> guide for more details.
          </>
        ),
      },
    ],
  },
  {
    name: 'Providers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    items: [
      {
        question: 'Which internet provider is the best?',
        answer: (
          <>
            It depends on your priorities and location. <Link href="/providers/att-internet" className="text-blue-400 hover:text-blue-300">AT&T Fiber</Link> and <Link href="/providers/verizon-fios" className="text-blue-400 hover:text-blue-300">Verizon Fios</Link> are excellent for fiber. <Link href="/providers/xfinity" className="text-blue-400 hover:text-blue-300">Xfinity</Link> and <Link href="/providers/spectrum" className="text-blue-400 hover:text-blue-300">Spectrum</Link> offer wide cable coverage. For budget options, see our <Link href="/cheapest/providers" className="text-blue-400 hover:text-blue-300">Cheapest Providers</Link> list.
          </>
        ),
      },
      {
        question: 'Why do I only have one provider option?',
        answer: 'Many areas have limited competition due to infrastructure costs and local regulations. Rural areas typically have fewer options. If you only have one wired option, consider 5G Home Internet from T-Mobile or Verizon, or satellite services like Starlink as alternatives.',
      },
      {
        question: 'Can I switch internet providers?',
        answer: 'Yes, you can switch providers anytime. Check if you have an early termination fee with your current provider. Most new providers offer free installation and may waive activation fees. Schedule overlap between old and new service to avoid downtime.',
      },
      {
        question: 'What should I look for when choosing a provider?',
        answer: (
          <>
            Consider: speed offerings, pricing (including post-promotional rates), data caps, contract requirements, customer service reputation, and equipment fees. Our <Link href="/guides" className="text-blue-400 hover:text-blue-300">Internet Guides</Link> can help you make an informed decision.
          </>
        ),
      },
    ],
  },
  {
    name: 'Pricing & Plans',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    items: [
      {
        question: 'What is a promotional price vs regular price?',
        answer: 'Promotional prices are temporary discounted rates for new customers, typically lasting 12-24 months. After this period, the price increases to the regular rate, which can be $20-50/month higher. Always ask about the post-promotional price before signing up.',
      },
      {
        question: 'What are data caps?',
        answer: 'Data caps limit how much data you can use per month. Going over may result in overage fees or throttled speeds. Fiber providers like AT&T Fiber and Verizon Fios typically have no data caps. Cable providers like Xfinity often have 1.2TB caps (with options to remove for extra cost).',
      },
      {
        question: 'Should I rent or buy my own router/modem?',
        answer: 'Buying your own equipment usually saves money long-term. Rental fees are typically $10-15/month, adding up to $120-180/year. A good router costs $100-200 and lasts several years. Check that your equipment is compatible with your provider before purchasing.',
      },
      {
        question: 'Are there hidden fees I should know about?',
        answer: 'Common fees include: equipment rental ($10-15/mo), installation ($50-150), activation fees ($10-50), early termination fees ($100-200), and regional sports fees for bundles. Ask for a complete breakdown before signing up.',
      },
      {
        question: 'How can I lower my internet bill?',
        answer: (
          <>
            Tips: Negotiate with retention department, buy your own equipment, skip TV bundles, use autopay discounts, and check for low-income assistance programs. See our <Link href="/deals" className="text-blue-400 hover:text-blue-300">Deals page</Link> for current promotions and discounts.
          </>
        ),
      },
    ],
  },
  {
    name: 'Technical',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    items: [
      {
        question: 'What is the difference between a modem and a router?',
        answer: 'A modem connects your home to your ISP\'s network and converts the signal. A router creates your home Wi-Fi network and connects multiple devices. Many providers offer combo units (gateway) that combine both functions.',
      },
      {
        question: 'How can I improve my Wi-Fi coverage?',
        answer: 'Tips: Place router centrally and elevated, away from walls and interference. Use 5GHz band for speed (shorter range) and 2.4GHz for range. Consider a mesh Wi-Fi system for larger homes. Update router firmware regularly.',
      },
      {
        question: 'What is fiber internet and why is it faster?',
        answer: (
          <>
            Fiber uses thin glass strands to transmit data as light pulses, allowing for much higher speeds than copper cables. Benefits include: symmetrical upload/download speeds, lower latency, and no signal degradation over distance. See <Link href="/best/fiber-providers" className="text-blue-400 hover:text-blue-300">Best Fiber Providers</Link> for options.
          </>
        ),
      },
      {
        question: 'What is 5G Home Internet?',
        answer: (
          <>
            5G Home Internet uses cellular networks instead of cables to deliver internet to your home. Providers like T-Mobile and <Link href="/providers/verizon-fios" className="text-blue-400 hover:text-blue-300">Verizon</Link> offer these services with speeds of 100-300+ Mbps, often with no data caps or contracts.
          </>
        ),
      },
      {
        question: 'Should I use a VPN?',
        answer: 'A VPN encrypts your internet traffic and hides your IP address. Consider using one for: public Wi-Fi security, privacy from your ISP, or accessing geo-restricted content. Note that VPNs may slightly reduce speed and some streaming services block them.',
      },
    ],
  },
]

// Generate JSON-LD structured data for FAQ
function generateFAQStructuredData() {
  const faqItems = faqData.flatMap(category =>
    category.items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: typeof item.answer === 'string' ? item.answer : item.question, // For JSX answers, use question as fallback
      },
    }))
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  }
}

function FAQAccordion({ category }: { category: FAQCategory }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 bg-gray-800/50">
        <div className="text-blue-400">{category.icon}</div>
        <h2 className="text-lg font-semibold">{category.name}</h2>
      </div>
      <div className="divide-y divide-gray-800">
        {category.items.map((item, index) => (
          <details key={index} className="group">
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-800/30 transition-colors list-none">
              <span className="font-medium pr-4">{item.question}</span>
              <svg
                className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-6 pb-4 text-gray-400">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

export default function FAQPage() {
  const structuredData = generateFAQStructuredData()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">FAQ</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium mb-4">
              Help Center
            </span>
            <h1 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Find answers to common questions about internet providers, speeds,
              pricing, and choosing the right plan for your needs.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {faqData.map((category) => (
              <a
                key={category.name}
                href={`#${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span className="text-blue-400">{category.icon}</span>
                {category.name}
              </a>
            ))}
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8 mb-12">
            {faqData.map((category) => (
              <div key={category.name} id={category.name.toLowerCase().replace(/\s+/g, '-')}>
                <FAQAccordion category={category} />
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-800/50 rounded-xl p-8 mb-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-gray-400 mb-6">
              Our AI assistant can help answer specific questions about providers in your area.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/tools/ai-assistant"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Ask AI Assistant
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Related Rankings */}
          <RelatedRankings title="Explore Internet Options" />

          {/* Quick Tools */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Helpful Tools</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/compare"
                className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Find Providers</div>
                  <div className="text-xs text-gray-400">Search by ZIP</div>
                </div>
              </Link>
              <Link
                href="/tools/speed-test"
                className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-600/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Speed Test</div>
                  <div className="text-xs text-gray-400">Check your speed</div>
                </div>
              </Link>
              <Link
                href="/tools/quiz"
                className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Speed Quiz</div>
                  <div className="text-xs text-gray-400">Get recommendations</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
