'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { AuroraBlobs } from '@/components/effects/AuroraBlobs'
import { CircuitPattern } from '@/components/effects/CircuitPattern'

interface AnimatedContentWrapperProps {
  children: ReactNode
  html: string
  showAuroraBlobs?: boolean
  showCircuitPattern?: boolean
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export function AnimatedContentWrapper({
  children,
  html,
  showAuroraBlobs = true,
  showCircuitPattern = true,
}: AnimatedContentWrapperProps) {
  return (
    <>
      {/* Animated backgrounds */}
      {showAuroraBlobs && <AuroraBlobs opacity={0.08} />}
      {showCircuitPattern && <CircuitPattern opacity={0.04} animated={true} />}

      <div className="min-h-screen relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb and other children with fade in */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>

            {/* Content with scroll-triggered fade-in-up animation */}
            <motion.article
              className="ipai-prose"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

// Simplified version for just wrapping content without the full layout
export function AnimatedArticle({ html }: { html: string }) {
  return (
    <motion.article
      className="ipai-prose"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      transition={{ duration: 0.6 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// Footer/back link with delayed fade in
export function AnimatedFooter({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="mt-12 pt-8 border-t border-gray-800"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}
