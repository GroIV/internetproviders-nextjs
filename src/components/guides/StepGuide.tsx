'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface Step {
  title: string
  description: string
  Icon?: LucideIcon
}

interface StepGuideProps {
  title?: string
  steps: Step[]
  gradient?: string
}

export function StepGuide({
  title,
  steps,
  gradient = 'from-cyan-500 to-blue-500',
}: StepGuideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {title && (
        <h3 className="text-xl font-semibold text-white mb-6">{title}</h3>
      )}

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700" />

        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative flex gap-4"
            >
              {/* Number circle */}
              <div className="relative flex-shrink-0 z-10">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-full blur-md opacity-40`} />
                <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  {step.Icon ? (
                    <step.Icon className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  )}
                </div>
              </div>

              {/* Content card */}
              <div className="flex-1 bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
