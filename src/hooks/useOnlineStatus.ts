'use client'

import { useState, useEffect, useCallback } from 'react'

interface OnlineStatus {
  isOnline: boolean
  wasOffline: boolean
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    // Track that we came back online (for showing "back online" messages)
    if (!isOnline) {
      setWasOffline(true)
      // Clear the "was offline" flag after 5 seconds
      setTimeout(() => setWasOffline(false), 5000)
    }
  }, [isOnline])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
  }, [])

  useEffect(() => {
    // Set initial state based on navigator.onLine
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline, wasOffline }
}
