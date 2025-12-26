'use client'

import { useState, useEffect } from 'react'

interface OnlineStatus {
  isOnline: boolean
  wasOffline: boolean
}

export function useOnlineStatus(): OnlineStatus {
  // Initialize with navigator.onLine if available
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine
    }
    return true
  })
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(prev => {
        // Track that we came back online (for showing "back online" messages)
        if (!prev) {
          setWasOffline(true)
          // Clear the "was offline" flag after 5 seconds
          setTimeout(() => setWasOffline(false), 5000)
        }
        return true
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, wasOffline }
}
