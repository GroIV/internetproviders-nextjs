'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Results {
  download: number
  upload: number
  latency: number
}

interface ActivityGridProps {
  results: Results
}

interface Activity {
  name: string
  icon: ReactNode
  minDownload: number
  minUpload: number
  maxLatency: number
}

const activities: Activity[] = [
  {
    name: 'HD Streaming',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    minDownload: 5,
    minUpload: 1,
    maxLatency: 100
  },
  {
    name: '4K Streaming',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    minDownload: 25,
    minUpload: 3,
    maxLatency: 100
  },
  {
    name: 'Video Calls',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    minDownload: 10,
    minUpload: 10,
    maxLatency: 150
  },
  {
    name: 'Gaming',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    minDownload: 25,
    minUpload: 5,
    maxLatency: 50
  },
  {
    name: 'Large Uploads',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    minDownload: 10,
    minUpload: 50,
    maxLatency: 200
  },
  {
    name: 'Work From Home',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    minDownload: 25,
    minUpload: 10,
    maxLatency: 100
  }
]

function getRating(download: number, upload: number, latency: number, activity: Activity): number {
  let score = 0

  // Download check (40%)
  if (download >= activity.minDownload * 4) score += 40
  else if (download >= activity.minDownload * 2) score += 30
  else if (download >= activity.minDownload) score += 20
  else score += (download / activity.minDownload) * 20

  // Upload check (30%)
  if (upload >= activity.minUpload * 4) score += 30
  else if (upload >= activity.minUpload * 2) score += 22
  else if (upload >= activity.minUpload) score += 15
  else score += (upload / activity.minUpload) * 15

  // Latency check (30%)
  if (latency <= activity.maxLatency / 4) score += 30
  else if (latency <= activity.maxLatency / 2) score += 22
  else if (latency <= activity.maxLatency) score += 15
  else score += Math.max(0, 15 - (latency - activity.maxLatency) / 10)

  return Math.min(100, Math.round(score))
}

function RatingDisplay({ rating }: { rating: number }) {
  if (rating >= 80) {
    return (
      <div className="flex gap-0.5">
        <span className="text-green-400">&#10003;</span>
        <span className="text-green-400">&#10003;</span>
        <span className="text-green-400">&#10003;</span>
      </div>
    )
  }
  if (rating >= 60) {
    return (
      <div className="flex gap-0.5">
        <span className="text-green-400">&#10003;</span>
        <span className="text-green-400">&#10003;</span>
        <span className="text-gray-600">&#10003;</span>
      </div>
    )
  }
  if (rating >= 40) {
    return (
      <div className="flex gap-0.5">
        <span className="text-amber-400">&#10003;</span>
        <span className="text-gray-600">&#10003;</span>
        <span className="text-gray-600">&#10003;</span>
      </div>
    )
  }
  return (
    <div className="flex gap-0.5">
      <span className="text-red-400">&#10005;</span>
      <span className="text-gray-600">&#10005;</span>
      <span className="text-gray-600">&#10005;</span>
    </div>
  )
}

export function ActivityGrid({ results }: ActivityGridProps) {
  return (
    <motion.div
      className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-200">Activity Suitability</h3>
      </div>
      <div className="divide-y divide-gray-800/50">
        {activities.map((activity, index) => {
          const rating = getRating(results.download, results.upload, results.latency, activity)
          return (
            <motion.div
              key={activity.name}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-400">{activity.icon}</div>
                <span className="text-sm text-gray-300">{activity.name}</span>
              </div>
              <RatingDisplay rating={rating} />
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
