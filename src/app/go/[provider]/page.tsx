'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getAffiliateUrl, hasAffiliateLink, providerDisplayNames } from '@/lib/affiliates'

export default function InterstitialPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const providerSlug = params.provider as string
  const source = searchParams.get('source') || providerSlug

  const [countdown, setCountdown] = useState(3)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [hasLink, setHasLink] = useState(true)


  // Get provider display name
  const providerName = providerDisplayNames[providerSlug] || providerSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  useEffect(() => {
    // Check if provider has affiliate link
    if (!hasAffiliateLink(providerSlug)) {
      setHasLink(false)
      return
    }

    // Get the affiliate URL
    const url = getAffiliateUrl(providerSlug, source)
    if (!url) {
      setHasLink(false)
      return
    }

    setRedirectUrl(url)

    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // Redirect
          window.location.href = url
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [providerSlug, source])

  // Provider not found or no affiliate link
  if (!hasLink) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Provider Not Available</h1>
          <p className="text-gray-400 mb-6">
            We don&apos;t currently have ordering available for this provider.
          </p>
          <Link
            href="/providers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Available Providers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-950 flex items-center justify-center px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* Animated circle */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-cyan-500/30"
            style={{ borderTopColor: 'rgb(6 182 212)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />

          {/* Inner content */}
          <div className="absolute inset-2 rounded-full bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
            <motion.span
              className="text-4xl font-bold text-cyan-400"
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {countdown}
            </motion.span>
          </div>
        </div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            Connecting you to {providerName}
          </h1>
          <p className="text-gray-400 mb-6">
            You&apos;ll be redirected to check availability and view plans
          </p>

          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          </div>

          {/* Manual link */}
          <p className="text-sm text-gray-500">
            Not redirecting?{' '}
            {redirectUrl && (
              <a
                href={redirectUrl}
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Click here
              </a>
            )}
          </p>
        </motion.div>

        {/* Back link */}
        <div className="mt-8">
          <Link
            href={`/providers/${providerSlug}`}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            &larr; Back to {providerName}
          </Link>
        </div>
      </div>
    </div>
  )
}
