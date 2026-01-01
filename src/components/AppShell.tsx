'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CommandCenterProvider, useCommandCenter, PanelConfig, INTERACTIVE_PANELS } from '@/contexts/CommandCenterContext'
import { ChatPanelEnhanced } from './command-center/ChatPanelEnhanced'
import {
  WelcomePanel,
  ProviderRecommendationsPanel,
  CoverageStatsPanel,
  PlanComparisonPanel,
  ProviderDetailPanel,
  SpeedTestPanel,
  AddressAvailabilityPanel,
} from './command-center/panels'

// Panel renderer for interactive panels
function InteractivePanel({ panel }: { panel: PanelConfig }) {
  const { showPageContent } = useCommandCenter()

  const renderPanel = () => {
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
              Take the full quiz &rarr;
            </a>
          </div>
        )
      case 'addressAvailability':
        return <AddressAvailabilityPanel data={panel.data as { address?: string }} />
      default:
        return null
    }
  }

  return (
    <div>
      {/* Back to page button */}
      <button
        onClick={showPageContent}
        className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to page
      </button>
      {renderPanel()}
    </div>
  )
}

// Main panel area that switches between page content and interactive panels
function PanelArea({ children }: { children: ReactNode }) {
  const { activePanel, isShowingInteractivePanel, showPageContent } = useCommandCenter()
  const pathname = usePathname()

  // Reset to page content when route changes
  useEffect(() => {
    if (isShowingInteractivePanel) {
      showPageContent()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      {activePanel.type === 'pageContent' ? (
        <motion.div
          key="pageContent"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      ) : activePanel.type === 'welcome' ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <WelcomePanel />
        </motion.div>
      ) : (
        <motion.div
          key={`interactive-${activePanel.type}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <InteractivePanel panel={activePanel} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// The unified layout with chat on left and content on right
function AppShellLayout({ children }: { children: ReactNode }) {
  const { mobileTab, setMobileTab } = useCommandCenter()

  return (
    <div className="flex flex-col flex-1">
      {/* Mobile Tab Bar */}
      <div className="lg:hidden sticky top-16 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
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
            onClick={() => setMobileTab('panel')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
              mobileTab === 'panel'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Content
            </span>
          </button>
        </div>
      </div>

      {/* Desktop: Split Layout */}
      <div className="hidden lg:flex flex-1 h-[calc(100vh-64px)]">
        {/* Chat Panel - Fixed Left */}
        <div className="w-[420px] flex-shrink-0 border-r border-gray-800 overflow-hidden">
          <ChatPanelEnhanced />
        </div>

        {/* Content Panel - Scrollable Right */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <PanelArea>{children}</PanelArea>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Tabbed Layout */}
      <div className="lg:hidden flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mobileTab === 'chat' ? (
            <motion.div
              key="mobile-chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <ChatPanelEnhanced />
            </motion.div>
          ) : (
            <motion.div
              key="mobile-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto p-4"
            >
              <PanelArea>{children}</PanelArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Main AppShell export - wraps everything in providers
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <CommandCenterProvider>
      <AppShellLayout>{children}</AppShellLayout>
    </CommandCenterProvider>
  )
}
