import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | InternetProviders.ai',
  description: 'Learn how InternetProviders.ai collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Privacy Policy</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: December 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-gray-300">
              InternetProviders.ai (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <h3 className="text-lg font-medium mb-2 text-gray-200">Information You Provide</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>ZIP codes entered to search for internet providers</li>
              <li>Email address if you subscribe to our newsletter</li>
              <li>Contact information if you reach out to us</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 text-gray-200">Information Collected Automatically</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>IP address and approximate location</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website or source</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Provide internet provider information for your area</li>
              <li>Improve our website and user experience</li>
              <li>Send newsletters and promotional communications (with your consent)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Analyze usage patterns and trends</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-gray-300 mb-4">
              We use cookies and similar tracking technologies to collect information about your
              browsing activities. These include:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site</li>
              <li><strong>Advertising cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
            <p className="text-gray-300 mt-4">
              You can control cookies through your browser settings. Note that disabling cookies
              may affect website functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-gray-300 mb-4">
              We may share information with third parties in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Analytics providers:</strong> To analyze website usage</li>
              <li><strong>Advertising partners:</strong> To serve relevant ads</li>
              <li><strong>Internet providers:</strong> When you click to sign up for their service</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-gray-300">
              We implement appropriate technical and organizational measures to protect your
              personal information. However, no internet transmission is completely secure, and
              we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-gray-300 mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Object to certain processing of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Children&apos;s Privacy</h2>
            <p className="text-gray-300">
              Our website is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-300">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@internetproviders.ai" className="text-blue-400 hover:underline">
                privacy@internetproviders.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
