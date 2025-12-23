'use client'

import { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ChatWindow } from './ChatWindow'
import { useChat } from '@/contexts/ChatContext'

export function PageChatSection() {
  const pathname = usePathname()
  const { setChatSectionVisible } = useChat()
  const sectionRef = useRef<HTMLDivElement>(null)

  // Don't show on homepage (has its own embedded chat) or AI assistant page
  const isHomepage = pathname === '/'
  const isAiAssistantPage = pathname === '/tools/ai-assistant'

  useEffect(() => {
    // If we're not showing the section, mark as not visible
    if (isHomepage || isAiAssistantPage) {
      setChatSectionVisible(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When less than 10% of the chat is visible, show floating button
        setChatSectionVisible(entry.intersectionRatio > 0.1)
      },
      {
        threshold: [0, 0.1, 0.5, 1],
        rootMargin: '-64px 0px 0px 0px' // Account for navbar height
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    // Initially visible
    setChatSectionVisible(true)

    return () => {
      observer.disconnect()
      setChatSectionVisible(false)
    }
  }, [isHomepage, isAiAssistantPage, setChatSectionVisible])

  // Don't render on homepage or AI assistant page
  if (isHomepage || isAiAssistantPage) {
    return null
  }

  return (
    <div ref={sectionRef} className="border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-transparent">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
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
