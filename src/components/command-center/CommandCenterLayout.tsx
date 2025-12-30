'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCommandCenter } from '@/contexts/CommandCenterContext'

interface CommandCenterLayoutProps {
  chatPanel: ReactNode
  dynamicPanels: ReactNode
}

export function CommandCenterLayout({ chatPanel, dynamicPanels }: CommandCenterLayoutProps) {
  const { mobileTab, setMobileTab } = useCommandCenter()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Tab Bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
        <div className="flex">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
              mobileTab === 'chat'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
            </span>
          </button>
          <button
            onClick={() => setMobileTab('panels')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
              mobileTab === 'panels'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Dashboard
            </span>
          </button>
        </div>
      </div>

      {/* Desktop: Split Layout */}
      <div className="hidden lg:flex flex-1 h-[calc(100vh-64px)]">
        {/* Chat Panel - Fixed Left */}
        <div className="w-[420px] flex-shrink-0 border-r border-gray-800 command-chat-panel overflow-hidden">
          {chatPanel}
        </div>

        {/* Dynamic Panels - Scrollable Right */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {dynamicPanels}
          </div>
        </div>
      </div>

      {/* Mobile: Tabbed Layout */}
      <div className="lg:hidden flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mobileTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              {chatPanel}
            </motion.div>
          ) : (
            <motion.div
              key="panels"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto p-4"
            >
              {dynamicPanels}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
