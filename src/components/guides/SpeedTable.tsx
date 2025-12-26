'use client'

import { motion } from 'framer-motion'

interface SpeedRow {
  activity: string
  minSpeed: string
  recommended: string
  icon?: React.ReactNode
}

interface SpeedTableProps {
  title?: string
  rows: SpeedRow[]
}

function getSpeedBarWidth(speedStr: string): number {
  const num = parseInt(speedStr.replace(/[^0-9]/g, ''), 10)
  if (isNaN(num)) return 10
  // Logarithmic scale for better visualization
  return Math.min(100, Math.max(10, Math.log10(num + 1) * 33))
}

function getSpeedColor(speedStr: string): string {
  const num = parseInt(speedStr.replace(/[^0-9]/g, ''), 10)
  if (num >= 100) return 'from-purple-500 to-pink-500'
  if (num >= 50) return 'from-cyan-500 to-blue-500'
  if (num >= 25) return 'from-green-500 to-emerald-500'
  return 'from-yellow-500 to-orange-500'
}

export function SpeedTable({
  title = 'Speed Recommendations',
  rows,
}: SpeedTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
    >
      {/* Header */}
      {title && (
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}

      {/* Table header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-700/50 text-sm font-medium text-gray-400">
        <div className="col-span-5">Activity</div>
        <div className="col-span-3">Min Speed</div>
        <div className="col-span-4">Recommended</div>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-gray-700/30">
        {rows.map((row, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-800/30 transition-colors items-center"
          >
            {/* Activity */}
            <div className="col-span-5 flex items-center gap-3">
              {row.icon && (
                <div className="flex-shrink-0 text-gray-400">
                  {row.icon}
                </div>
              )}
              <span className="text-white font-medium text-sm">{row.activity}</span>
            </div>

            {/* Min Speed */}
            <div className="col-span-3">
              <div className="space-y-1">
                <span className="text-sm text-gray-300">{row.minSpeed}</span>
                <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getSpeedColor(row.minSpeed)} rounded-full`}
                    style={{ width: `${getSpeedBarWidth(row.minSpeed)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommended */}
            <div className="col-span-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-cyan-400">{row.recommended}</span>
                <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getSpeedColor(row.recommended)} rounded-full`}
                    style={{ width: `${getSpeedBarWidth(row.recommended)}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <div className="px-6 py-3 bg-gray-800/30 border-t border-gray-700/50">
        <p className="text-xs text-gray-500">
          Speeds shown in Mbps. Recommended speeds account for multiple users and devices.
        </p>
      </div>
    </motion.div>
  )
}
