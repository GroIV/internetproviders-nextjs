'use client'

import { motion } from 'framer-motion'

interface ComparisonBarsProps {
  download: number
  upload: number
}

const US_AVERAGE_DOWNLOAD = 150 // Mbps
const US_AVERAGE_UPLOAD = 20 // Mbps

export function ComparisonBars({ download, upload }: ComparisonBarsProps) {
  // Calculate percentage of 500 Mbps max for display
  const maxSpeed = 500
  const downloadPct = Math.min((download / maxSpeed) * 100, 100)
  const uploadPct = Math.min((upload / maxSpeed) * 100, 100)
  const avgDownloadPct = Math.min((US_AVERAGE_DOWNLOAD / maxSpeed) * 100, 100)
  const avgUploadPct = Math.min((US_AVERAGE_UPLOAD / maxSpeed) * 100, 100)

  const downloadDiff = download - US_AVERAGE_DOWNLOAD
  const uploadDiff = upload - US_AVERAGE_UPLOAD

  return (
    <motion.div
      className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <h3 className="text-sm font-semibold text-gray-200 mb-4">Speed Comparison</h3>

      {/* Download Comparison */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Download Speed</span>
          <span className={downloadDiff >= 0 ? 'text-green-400' : 'text-amber-400'}>
            {downloadDiff >= 0 ? '+' : ''}{downloadDiff.toFixed(1)} Mbps vs average
          </span>
        </div>

        {/* Your speed */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Your speed</span>
            <span className="text-cyan-400 font-medium">{download} Mbps</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${downloadPct}%` }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              style={{
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
              }}
            />
          </div>
        </div>

        {/* US Average */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">US Average</span>
            <span className="text-gray-500">{US_AVERAGE_DOWNLOAD} Mbps</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gray-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${avgDownloadPct}%` }}
              transition={{ duration: 0.6, delay: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* Upload Comparison */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Upload Speed</span>
          <span className={uploadDiff >= 0 ? 'text-green-400' : 'text-amber-400'}>
            {uploadDiff >= 0 ? '+' : ''}{uploadDiff.toFixed(1)} Mbps vs average
          </span>
        </div>

        {/* Your speed */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Your speed</span>
            <span className="text-purple-400 font-medium">{upload} Mbps</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadPct}%` }}
              transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
              style={{
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
              }}
            />
          </div>
        </div>

        {/* US Average */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">US Average</span>
            <span className="text-gray-500">{US_AVERAGE_UPLOAD} Mbps</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gray-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${avgUploadPct}%` }}
              transition={{ duration: 0.6, delay: 0.9 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
