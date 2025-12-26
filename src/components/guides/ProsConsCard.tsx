'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

interface ProsConsCardProps {
  title?: string
  pros: string[]
  cons: string[]
}

export function ProsConsCard({
  title = 'Pros & Cons',
  pros,
  cons,
}: ProsConsCardProps) {
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
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}

      {/* Two columns */}
      <div className="grid md:grid-cols-2">
        {/* Pros */}
        <div className="p-6 relative">
          {/* Green glow */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full blur-3xl opacity-10" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-green-400">Pros</span>
            </div>

            <ul className="space-y-3">
              {pros.map((pro, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                  </div>
                  <span className="text-sm text-gray-300">{pro}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-700/50" />

        {/* Cons */}
        <div className="p-6 border-t md:border-t-0 md:border-l border-gray-700/50 relative">
          {/* Red glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-red-500 to-rose-500 rounded-full blur-3xl opacity-10" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-red-400">Cons</span>
            </div>

            <ul className="space-y-3">
              {cons.map((con, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                      <X className="w-3 h-3 text-red-400" />
                    </div>
                  </div>
                  <span className="text-sm text-gray-300">{con}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
