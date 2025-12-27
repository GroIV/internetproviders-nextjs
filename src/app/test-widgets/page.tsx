'use client'

import Script from 'next/script'
import { useState, useEffect, useRef } from 'react'

export default function WidgetTestPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)
  const widget1Ref = useRef<HTMLDivElement>(null)
  const widget2Ref = useRef<HTMLDivElement>(null)

  // Manually reinitialize widgets after script loads
  useEffect(() => {
    if (scriptLoaded && typeof window !== 'undefined') {
      // Try to find and call any init function the script might expose
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- external widget script
      const win = window as any
      if (win.myFinance?.init) {
        win.myFinance.init()
      } else if (win.MyFinance?.init) {
        win.MyFinance.init()
      }
      console.log('Window myFinance object:', win.myFinance || win.MyFinance || 'Not found')
    }
  }, [scriptLoaded])

  return (
    <>
      {/* MyFinance Widget Script - use lazyOnload to ensure DOM is ready */}
      <Script
        src="https://static.myfinance.com/widget/myfinance.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('MyFinance script loaded')
          setScriptLoaded(true)
        }}
        onError={() => {
          console.error('MyFinance script failed to load')
          setScriptError(true)
        }}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-sm mb-4">
              Test Page - Not for Production
            </span>
            <h1 className="text-4xl font-bold mb-4">Widget Test Page</h1>
            <p className="text-gray-400 text-lg">
              Testing MyFinance provider order widgets with tracking
            </p>

            {/* Script Status */}
            <div className="mt-4">
              {scriptError ? (
                <span className="inline-block px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm">
                  Script Failed to Load
                </span>
              ) : scriptLoaded ? (
                <span className="inline-block px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
                  Script Loaded Successfully
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                  Loading Script...
                </span>
              )}
            </div>
          </div>

          {/* Widget 1: Full Address with Questions */}
          <section className="mb-16">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
              <h2 className="text-2xl font-bold mb-2">Widget 1: Full Address with Questions</h2>
              <p className="text-gray-400 mb-4">
                Campaign: <code className="bg-gray-800 px-2 py-1 rounded">chameleon-konecteaze-zip-with-questions</code>
              </p>
              <p className="text-gray-400 mb-4">
                Sub ID: <code className="bg-gray-800 px-2 py-1 rounded">IPAIwidget-test</code>
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 min-h-[400px]">
              <div
                ref={widget1Ref}
                dangerouslySetInnerHTML={{
                  __html: `<div class="myFinance-widget" data-ad-id="ae0ef877-d2fa-4bf4-948c-a337c3163f3c" data-campaign="chameleon-konecteaze-zip-with-questions" data-sub-id="IPAIwidget-test"></div>`
                }}
              />
            </div>
          </section>

          {/* Widget 2: Full Page */}
          <section className="mb-16">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
              <h2 className="text-2xl font-bold mb-2">Widget 2: Full Page</h2>
              <p className="text-gray-400 mb-4">
                Campaign: <code className="bg-gray-800 px-2 py-1 rounded">chameleon-konecteaze-full-page</code>
              </p>
              <p className="text-gray-400 mb-4">
                Sub ID: <code className="bg-gray-800 px-2 py-1 rounded">IPAIwidget-test</code>
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 min-h-[600px]">
              <div
                ref={widget2Ref}
                dangerouslySetInnerHTML={{
                  __html: `<div class="myFinance-widget" data-ad-id="faecb400-90d0-490d-b0b8-56d7ab96f9fe" data-campaign="chameleon-konecteaze-full-page" data-sub-id="IPAIwidget-test"></div>`
                }}
              />
            </div>
          </section>

          {/* Sub ID Examples */}
          <section className="mb-16">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Sub ID Tracking Examples</h2>
              <p className="text-gray-400 mb-4">
                When we integrate these widgets across the site, we&apos;ll use different sub_ids to track where conversions come from:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Page-Based Tracking</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li><code className="text-blue-400">IPAIhome</code> - Homepage</li>
                    <li><code className="text-blue-400">IPAIcompare</code> - Compare page</li>
                    <li><code className="text-blue-400">IPAIguides</code> - Guides section</li>
                    <li><code className="text-blue-400">IPAIdeals</code> - Deals page</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Provider-Specific Tracking</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li><code className="text-blue-400">IPAIxfinity</code> - Xfinity page</li>
                    <li><code className="text-blue-400">IPAIatt-internet</code> - AT&T page</li>
                    <li><code className="text-blue-400">IPAIverizon-fios</code> - Verizon page</li>
                    <li><code className="text-blue-400">IPAIchat</code> - From AI chat</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-4">Notes</h2>
              <ul className="text-gray-300 space-y-2">
                <li>• This page is set to <code className="bg-gray-800 px-1 rounded">noindex</code> - it won&apos;t appear in search results</li>
                <li>• Widgets may take a moment to load after the page renders</li>
                <li>• The white background is intentional - most widgets expect a light background</li>
                <li>• Sub IDs follow the format: <code className="bg-gray-800 px-1 rounded">IPAI&#123;source&#125;</code></li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
