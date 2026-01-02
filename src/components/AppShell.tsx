'use client'

import { ReactNode, useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { CommandCenterProvider, useCommandCenter, PanelConfig } from '@/contexts/CommandCenterContext'

// Loading skeleton for chat panel
function ChatPanelSkeleton() {
  return (
    <div className="h-full flex flex-col p-4 animate-pulse">
      <div className="h-8 bg-gray-800 rounded w-3/4 mb-4" />
      <div className="flex-1 space-y-3">
        <div className="h-16 bg-gray-800/50 rounded-lg" />
        <div className="h-12 bg-gray-800/50 rounded-lg w-5/6 ml-auto" />
        <div className="h-16 bg-gray-800/50 rounded-lg" />
      </div>
      <div className="h-12 bg-gray-800 rounded-lg mt-4" />
    </div>
  )
}

// Loading skeleton for panels
function PanelSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-6 bg-gray-800 rounded w-1/2 mb-4" />
      <div className="space-y-3">
        <div className="h-20 bg-gray-800/50 rounded-lg" />
        <div className="h-20 bg-gray-800/50 rounded-lg" />
        <div className="h-20 bg-gray-800/50 rounded-lg" />
      </div>
    </div>
  )
}

// Dynamic imports with code splitting for heavy components
const ChatPanelEnhanced = dynamic(
  () => import('./command-center/ChatPanelEnhanced').then(mod => mod.ChatPanelEnhanced),
  { loading: () => <ChatPanelSkeleton />, ssr: false }
)

const WelcomePanel = dynamic(
  () => import('./command-center/panels').then(mod => mod.WelcomePanel),
  { loading: () => <PanelSkeleton /> }
)

const ProviderRecommendationsPanel = dynamic(
  () => import('./command-center/panels').then(mod => mod.ProviderRecommendationsPanel),
  { loading: () => <PanelSkeleton /> }
)

const CoverageStatsPanel = dynamic(
  () => import('./command-center/panels').then(mod => mod.CoverageStatsPanel),
  { loading: () => <PanelSkeleton /> }
)

const PlanComparisonPanel = dynamic(
  () => import('./command-center/panels').then(mod => mod.PlanComparisonPanel),
  { loading: () => <PanelSkeleton /> }
)

const ProviderDetailPanel = dynamic(
  () => import('./command-center/panels').then(mod => mod.ProviderDetailPanel),
  { loading: () => <PanelSkeleton /> }
)

const SpeedTestPanel = dynamic(
  () => import('./command-center/panels').then(mod => mod.SpeedTestPanel),
  { loading: () => <PanelSkeleton /> }
)

const AddressAvailabilityPanel = dynamic(
  () => import('./command-center/panels').then(mod => mod.AddressAvailabilityPanel),
  { loading: () => <PanelSkeleton /> }
)

// Helper to get page name from pathname
function getPageName(pathname: string): string {
  if (pathname === '/') return 'Home'

  // Provider pages
  if (pathname.startsWith('/providers/')) {
    const slug = pathname.split('/providers/')[1]?.split('/')[0]
    if (!slug) return 'Providers'
    // Format provider name
    const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    if (slug === 'att-internet') return 'AT&T'
    if (slug === 'verizon-fios') return 'Verizon Fios'
    if (slug === 't-mobile') return 'T-Mobile'
    if (slug === 'google-fiber') return 'Google Fiber'
    return name
  }

  // State/city pages
  if (pathname.startsWith('/internet/')) {
    const parts = pathname.split('/internet/')[1]?.split('/')
    if (parts?.length === 2) {
      const city = parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      return city
    } else if (parts?.length === 1) {
      const state = parts[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      return state
    }
  }

  // Compare pages
  if (pathname.startsWith('/compare/')) {
    return 'Compare'
  }

  // Guide pages
  if (pathname.startsWith('/guides/')) {
    return 'Guides'
  }

  // Static pages
  const pageNames: Record<string, string> = {
    '/providers': 'Providers',
    '/compare': 'Compare',
    '/guides': 'Guides',
    '/tools': 'Tools',
    '/tools/speed-test': 'Speed Test',
    '/tools/quiz': 'Quiz',
    '/deals': 'Deals',
    '/faq': 'FAQ',
    '/about': 'About',
    '/contact': 'Contact',
    '/plans': 'Plans',
    '/check-availability': 'Availability',
  }

  return pageNames[pathname] || 'Browse'
}

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- showPageContent changes on every render; only pathname change should trigger reset
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      {activePanel.type === 'pageContent' ? (
        <motion.div
          key="pageContent"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.div>
      ) : activePanel.type === 'welcome' ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <WelcomePanel />
        </motion.div>
      ) : (
        <motion.div
          key={`interactive-${activePanel.type}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <InteractivePanel panel={activePanel} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Floating chat bubble for mobile when on Content tab
function FloatingChatBubble({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 flex items-center justify-center"
    >
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-25" />
    </motion.button>
  )
}

// The unified layout with chat on left and content on right
function AppShellLayout({ children }: { children: ReactNode }) {
  const { mobileTab, setMobileTab } = useCommandCenter()
  const pathname = usePathname()
  const pageName = getPageName(pathname)

  // Swipe gesture handling
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const [swiping, setSwiping] = useState(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return

    const deltaX = e.touches[0].clientX - touchStartX.current
    const deltaY = e.touches[0].clientY - touchStartY.current

    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      setSwiping(true)
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || !swiping) {
      touchStartX.current = null
      touchStartY.current = null
      setSwiping(false)
      return
    }

    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const threshold = 80 // Minimum swipe distance

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && mobileTab === 'panel') {
        // Swipe right -> go to chat
        setMobileTab('chat')
      } else if (deltaX < 0 && mobileTab === 'chat') {
        // Swipe left -> go to content
        setMobileTab('panel')
      }
    }

    touchStartX.current = null
    touchStartY.current = null
    setSwiping(false)
  }, [mobileTab, setMobileTab, swiping])

  return (
    <div className="flex flex-col flex-1">
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

      {/* Mobile: Tabbed Layout with swipe - both tabs stay mounted to preserve state */}
      <div
        className="lg:hidden flex-1 overflow-hidden pb-16 overflow-x-hidden max-w-full relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Chat tab - always mounted, visibility controlled by CSS */}
        <div
          className={`absolute inset-0 transition-opacity duration-150 ${
            mobileTab === 'chat'
              ? 'opacity-100 z-10 pointer-events-auto'
              : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <ChatPanelEnhanced />
        </div>

        {/* Content tab - always mounted, visibility controlled by CSS */}
        <div
          className={`absolute inset-0 overflow-y-auto p-4 transition-opacity duration-150 ${
            mobileTab === 'panel'
              ? 'opacity-100 z-10 pointer-events-auto'
              : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <PanelArea>{children}</PanelArea>
        </div>

        {/* Floating chat bubble when on Content tab */}
        <AnimatePresence>
          {mobileTab === 'panel' && (
            <FloatingChatBubble onClick={() => setMobileTab('chat')} />
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 safe-area-pb">
        <div className="flex">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-3 px-4 transition-all ${
              mobileTab === 'chat'
                ? 'text-cyan-400'
                : 'text-gray-500'
            }`}
          >
            <span className="flex flex-col items-center gap-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs font-medium">Chat</span>
              {mobileTab === 'chat' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              )}
            </span>
          </button>
          <button
            onClick={() => setMobileTab('panel')}
            className={`flex-1 py-3 px-4 transition-all relative ${
              mobileTab === 'panel'
                ? 'text-cyan-400'
                : 'text-gray-500'
            }`}
          >
            <span className="flex flex-col items-center gap-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-xs font-medium truncate max-w-[80px]">{pageName}</span>
              {mobileTab === 'panel' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              )}
            </span>
          </button>
        </div>
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
