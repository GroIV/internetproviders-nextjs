'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'
import * as Sentry from '@sentry/nextjs'

// Send metrics to analytics/monitoring
function sendToAnalytics(metric: Metric) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating, // 'good', 'needs-improvement', 'poor'
      delta: metric.delta,
      id: metric.id,
    })
  }

  // Send to Sentry as a custom measurement
  Sentry.addBreadcrumb({
    category: 'web-vital',
    message: `${metric.name}: ${metric.value}`,
    level: metric.rating === 'poor' ? 'warning' : 'info',
    data: {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    },
  })

  // Report poor metrics to Sentry
  if (metric.rating === 'poor') {
    Sentry.captureMessage(`Poor Web Vital: ${metric.name}`, {
      level: 'warning',
      extra: {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        navigationType: metric.navigationType,
      },
    })
  }

  // You can also send to other analytics services
  // Example: Send to Google Analytics
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = window.gtag as (
      command: string,
      action: string,
      params: Record<string, unknown>
    ) => void
    gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    })
  }

  // Example: Send to custom endpoint
  // Uncomment and configure as needed:
  /*
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    page: window.location.pathname,
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body)
  } else {
    fetch('/api/vitals', { body, method: 'POST', keepalive: true })
  }
  */
}

export function WebVitals() {
  useEffect(() => {
    // Core Web Vitals
    onCLS(sendToAnalytics)  // Cumulative Layout Shift
    onINP(sendToAnalytics)  // Interaction to Next Paint (replaced FID)
    onLCP(sendToAnalytics)  // Largest Contentful Paint

    // Other useful metrics
    onFCP(sendToAnalytics)  // First Contentful Paint
    onTTFB(sendToAnalytics) // Time to First Byte
  }, [])

  // This component doesn't render anything
  return null
}

// Thresholds for reference (from Google's Web Vitals)
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // ms
  INP: { good: 200, poor: 500 },   // ms
  CLS: { good: 0.1, poor: 0.25 },  // score
  FCP: { good: 1800, poor: 3000 }, // ms
  TTFB: { good: 800, poor: 1800 }, // ms
}
