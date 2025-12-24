'use client'

import { useRef, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { ChatWindow } from './ChatWindow'
import { useChat } from '@/contexts/ChatContext'

// Generate a readable page title from pathname
function getPageTitle(pathname: string): string {
  // Provider pages
  if (pathname.startsWith('/providers/')) {
    const slug = pathname.split('/providers/')[1]
    let name = slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || ''
    // Clean up common names
    if (slug === 'att-internet') name = 'AT&T Internet'
    if (slug === 'verizon-fios') name = 'Verizon Fios'
    return name
  }

  // Comparison pages
  if (pathname.startsWith('/compare/') && pathname.includes('-vs-')) {
    const comparison = pathname.split('/compare/')[1]
    const isTech = comparison?.startsWith('technology/')
    const parts = comparison?.replace('technology/', '').split('-vs-')
    if (parts?.length === 2) {
      const p1 = parts[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const p2 = parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      return `${p1} vs ${p2}${isTech ? ' (Technology)' : ''}`
    }
  }

  // State/City pages
  if (pathname.startsWith('/internet/')) {
    const parts = pathname.split('/internet/')[1]?.split('/')
    if (parts?.length === 2) {
      const city = parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const state = parts[0].toUpperCase()
      return `Internet in ${city}, ${state}`
    } else if (parts?.length === 1) {
      const state = parts[0].toUpperCase()
      return `Internet in ${state}`
    }
  }

  // Best/ranking pages
  if (pathname.startsWith('/best/')) {
    const type = pathname.split('/best/')[1]?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    return `Best ${type}`
  }
  if (pathname.startsWith('/cheapest/')) {
    return 'Cheapest Providers'
  }
  if (pathname.startsWith('/fastest/')) {
    return 'Fastest Providers'
  }

  // Guide pages
  if (pathname.startsWith('/guides/')) {
    const slug = pathname.split('/guides/')[1]
    return slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Guide'
  }

  // Static pages
  const pageNames: Record<string, string> = {
    '/providers': 'All Providers',
    '/compare': 'Compare Providers',
    '/guides': 'Guides & Resources',
    '/tools': 'Tools',
    '/tools/speed-test': 'Speed Test',
    '/tools/quiz': 'Internet Quiz',
    '/deals': 'Current Deals',
    '/faq': 'FAQ',
    '/about': 'About Us',
    '/contact': 'Contact',
  }

  return pageNames[pathname] || 'Browse'
}

export function PageChatSection() {
  const pathname = usePathname()
  const { setChatSectionVisible, sendProactiveMessage, hasWelcomed } = useChat()
  const sectionRef = useRef<HTMLDivElement>(null)
  const prevPathname = useRef<string | null>(null)

  // Get page title
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname])

  // Don't show on homepage (has its own embedded chat) or AI assistant page
  const isHomepage = pathname === '/'
  const isAiAssistantPage = pathname === '/tools/ai-assistant'
  const shouldRender = !isHomepage && !isAiAssistantPage

  // Scroll to top when navigating to a new page (so user sees the chat)
  useEffect(() => {
    if (!shouldRender) return

    // Only scroll on actual navigation (not initial load)
    if (prevPathname.current !== null && pathname !== prevPathname.current) {
      window.scrollTo(0, 0)
    }
    prevPathname.current = pathname
  }, [pathname, shouldRender])

  // Send proactive message when navigating to a new page (after welcome)
  useEffect(() => {
    if (!shouldRender || !hasWelcomed) return

    const timer = setTimeout(() => {
      sendProactiveMessage(pathname)
    }, 500)
    return () => clearTimeout(timer)
  }, [pathname, hasWelcomed, shouldRender, sendProactiveMessage])

  // Visibility tracking using scroll position instead of IntersectionObserver
  // This is more reliable during hydration and page transitions
  useEffect(() => {
    if (!shouldRender) {
      setChatSectionVisible(false)
      return
    }

    // Always mark as visible initially
    setChatSectionVisible(true)

    let userHasScrolled = false

    const checkVisibility = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const navbarHeight = 64

      // Section is visible if its bottom is below the navbar
      // We consider it visible if at least 50px of it is showing
      const isVisible = rect.bottom > navbarHeight + 50

      // Only allow hiding after user has scrolled past a threshold
      // This prevents false negatives during hydration
      if (!userHasScrolled && window.scrollY < 100) {
        setChatSectionVisible(true)
        return
      }

      if (window.scrollY >= 100) {
        userHasScrolled = true
      }

      setChatSectionVisible(isVisible)
    }

    // Check visibility on scroll
    const handleScroll = () => {
      checkVisibility()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Also check after a delay to handle any late layout shifts
    const timeoutId = setTimeout(checkVisibility, 500)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [shouldRender, setChatSectionVisible])

  // Don't render on homepage or AI assistant page
  if (!shouldRender) {
    return null
  }

  return (
    <div ref={sectionRef} className="border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-transparent">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Header with page context */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-sm mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {pageTitle}
            </div>
            <h2 className="text-xl font-semibold text-white mb-1">
              AI Assistant
            </h2>
            <p className="text-sm text-gray-400">
              Ask questions about this page or internet providers in your area
            </p>
          </div>

          {/* Chat Window - Compact for above-content placement */}
          <ChatWindow
            embedded={true}
            showQuickActions={true}
            className="h-[350px] min-h-0"
          />
        </div>
      </div>
    </div>
  )
}
