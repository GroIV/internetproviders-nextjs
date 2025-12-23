'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus()

  // Show "back online" message briefly
  if (wasOffline && isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-400 rounded-full text-sm font-medium animate-pulse">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>Back Online</span>
      </div>
    )
  }

  // Show offline indicator
  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600/20 text-yellow-400 rounded-full text-sm font-medium">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
        <span>Offline</span>
      </div>
    )
  }

  // Don't render anything when online (normal state)
  return null
}
