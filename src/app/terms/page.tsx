import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | InternetProviders.ai',
  description: 'Read the terms and conditions for using InternetProviders.ai website and services.',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Terms of Service</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: December 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
            <p className="text-gray-300">
              By accessing or using InternetProviders.ai ("the Website"), you agree to be bound
              by these Terms of Service. If you do not agree to these terms, please do not use
              our Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p className="text-gray-300">
              InternetProviders.ai provides information about internet service providers,
              including coverage data, pricing, and promotional offers. We help consumers
              compare and find internet services available in their area.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information Accuracy</h2>
            <p className="text-gray-300 mb-4">
              While we strive to provide accurate and up-to-date information, we make no
              warranties or representations about:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>The accuracy, completeness, or timeliness of provider information</li>
              <li>Actual availability of services at your specific address</li>
              <li>Current pricing, promotions, or offers from providers</li>
              <li>Quality of service from any internet provider</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Always verify information directly with the internet service provider before
              making purchasing decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Affiliate Relationships</h2>
            <p className="text-gray-300">
              We participate in affiliate programs with various internet service providers.
              When you click on links to providers and sign up for their services, we may
              receive a commission. These relationships do not affect our editorial integrity
              or the information we provide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">User Conduct</h2>
            <p className="text-gray-300 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Use the Website for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Website's operation</li>
              <li>Use automated tools to scrape or collect data from the Website</li>
              <li>Impersonate any person or entity</li>
              <li>Upload malicious code or content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
            <p className="text-gray-300">
              All content on this Website, including text, graphics, logos, and software,
              is the property of InternetProviders.ai or our licensors and is protected by
              copyright and other intellectual property laws. You may not reproduce, distribute,
              or create derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Links</h2>
            <p className="text-gray-300">
              Our Website contains links to third-party websites, including internet service
              providers. We are not responsible for the content, privacy practices, or terms
              of service of these external sites. Your use of third-party websites is at your
              own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
            <p className="text-gray-300">
              THE WEBSITE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
              EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS
              FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT THE
              WEBSITE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-gray-300">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, INTERNETPROVIDERS.AI SHALL NOT BE LIABLE
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING
              FROM YOUR USE OF THE WEBSITE OR RELIANCE ON INFORMATION PROVIDED. OUR TOTAL
              LIABILITY SHALL NOT EXCEED $100.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
            <p className="text-gray-300">
              You agree to indemnify and hold harmless InternetProviders.ai and its officers,
              directors, employees, and agents from any claims, damages, or expenses arising
              from your use of the Website or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these Terms at any time. Changes will be effective
              immediately upon posting. Your continued use of the Website after changes
              constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p className="text-gray-300">
              These Terms shall be governed by and construed in accordance with the laws of
              the State of Delaware, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-gray-300">
              For questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@internetproviders.ai" className="text-blue-400 hover:underline">
                legal@internetproviders.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
