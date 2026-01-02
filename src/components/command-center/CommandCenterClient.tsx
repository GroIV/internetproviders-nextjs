'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CommandCenterProvider, useCommandCenter, PanelConfig } from '@/contexts/CommandCenterContext'
import { CommandCenterLayout } from './CommandCenterLayout'
import { ChatPanelEnhanced } from './ChatPanelEnhanced'
import {
  WelcomePanel,
  ProviderRecommendationsPanel,
  CoverageStatsPanel,
  PlanComparisonPanel,
  ProviderDetailPanel,
  SpeedTestPanel,
  AddressAvailabilityPanel,
} from './panels'

// Panel renderer based on type
function DynamicPanel({ panel }: { panel: PanelConfig }) {
  switch (panel.type) {
    case 'welcome':
      return <WelcomePanel />
    case 'recommendations':
      return <ProviderRecommendationsPanel data={panel.data as { zipCode?: string }} />
    case 'coverage':
      return <CoverageStatsPanel data={panel.data as { zipCode?: string }} />
    case 'comparison':
      return <PlanComparisonPanel data={panel.data as { providers?: string[] }} />
    case 'providerDetail':
      return <ProviderDetailPanel data={panel.data as { providerSlug?: string; providerName?: string }} />
    case 'speedTest':
      return <SpeedTestPanel />
    case 'quiz':
      return (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Quiz coming soon!</p>
          <a href="/tools/quiz" className="text-cyan-400 hover:text-cyan-300">
            Take the full quiz →
          </a>
        </div>
      )
    case 'addressAvailability':
      return <AddressAvailabilityPanel data={panel.data as { address?: string }} />
    default:
      return null
  }
}

// Intro tip banner
function IntroBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className="mb-4 relative overflow-hidden"
    >
      <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/20 rounded-xl p-3 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          {/* Animated icon */}
          <div className="flex-shrink-0 mt-0.5">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Interactive Panel</p>
            <p className="text-xs text-gray-400 mt-0.5">
              This panel updates as you chat! Ask about providers, request comparisons, or run a speed test.
            </p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            aria-label="Dismiss intro tip"
            className="flex-shrink-0 p-1 text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Animated gradient line */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 8, ease: 'linear' }}
        />
      </div>
    </motion.div>
  )
}

// Connection indicator that animates from chat to panel
function ConnectionIndicator({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="hidden lg:block absolute left-[420px] top-1/2 -translate-y-1/2 z-10 pointer-events-none"
        >
          {/* Animated arrow/pulse */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.6, times: [0, 0.2, 0.8, 1] }}
            className="flex items-center gap-1"
          >
            <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500" />
            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Single panel with enhanced animations
function SinglePanel() {
  const { activePanel } = useCommandCenter()
  // Use lazy initializer to check localStorage synchronously without effect
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('panel_intro_dismissed') !== 'true'
  })
  const [showConnection, setShowConnection] = useState(false)
  const [showPulse, setShowPulse] = useState(false)
  const prevPanelRef = useRef(activePanel.type)
  const isFirstRender = useRef(true)

  // Handle banner dismissal
  const handleDismissBanner = () => {
    setShowBanner(false)
    localStorage.setItem('panel_intro_dismissed', 'true')
  }

  // Trigger connection indicator and pulse on panel change
  // This effect intentionally sets state to trigger animations when panel changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (prevPanelRef.current !== activePanel.type) {
      // Show connection indicator - intentional animation trigger
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional state change to trigger visual feedback animation
      setShowConnection(true)
      setTimeout(() => setShowConnection(false), 600)

      // Show pulse effect
      setShowPulse(true)
      setTimeout(() => setShowPulse(false), 800)

      prevPanelRef.current = activePanel.type
    }
  }, [activePanel.type])

  return (
    <div className="relative">
      {/* Connection indicator */}
      <ConnectionIndicator show={showConnection} />

      {/* Intro banner */}
      <AnimatePresence>
        {showBanner && <IntroBanner onDismiss={handleDismissBanner} />}
      </AnimatePresence>

      {/* Panel with pulse effect */}
      <div className="relative">
        {/* Pulse glow effect */}
        <AnimatePresence>
          {showPulse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: [0, 0.5, 0], scale: [0.95, 1.02, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-xl pointer-events-none"
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={activePanel.type + JSON.stringify(activePanel.data || {})}
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <DynamicPanel panel={activePanel} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function CommandCenterContent() {
  return (
    <CommandCenterLayout
      chatPanel={<ChatPanelEnhanced />}
      dynamicPanels={<SinglePanel />}
    />
  )
}

export function CommandCenterClient() {
  return (
    <CommandCenterProvider>
      <CommandCenterContent />
    </CommandCenterProvider>
  )
}
