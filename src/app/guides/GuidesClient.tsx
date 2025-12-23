'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocation } from '@/contexts/LocationContext'

interface GuidesClientProps {
  zipCode?: string
  zipHasGuides: boolean
  categoryLabels: Record<string, string>
  categoryColors: Record<string, string>
}

export function GuidesClient({ zipCode }: GuidesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { location } = useLocation()

  // Auto-redirect to include ZIP if user has location but URL doesn't have zip param
  useEffect(() => {
    if (location?.zipCode && !zipCode) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('zip', location.zipCode)
      router.replace(`/guides?${params.toString()}`)
    }
  }, [location?.zipCode, zipCode, router, searchParams])

  return null // This component just handles the redirect logic
}
