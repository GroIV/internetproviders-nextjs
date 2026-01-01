'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useChat } from '@/contexts/ChatContext'
import { ChatWindow } from './ChatWindow'

export function FloatingChatButton() {
  const pathname = usePathname()
  const { isOpen, setIsOpen, messages } = useChat()
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  // Don't show on homepage (has its own embedded chat) or AI assistant page
  const isHomepage = pathname === '/'
  const isAiAssistantPage = pathname === '/tools/ai-assistant'

  if (!isMounted || isHomepage || isAiAssistantPage) {
    return null
  }

  // Always show the button on non-homepage pages
  const showButton = true

  return (
    <>
      {/* Floating Action Button - appears when chat scrolls out of view */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          showButton
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        } ${
          isOpen
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-6 h-6 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {/* Notification dot when there are messages */}
            {messages.length > 1 && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full" />
            )}
          </div>
        )}
      </button>

      {/* Desktop: Floating chat panel */}
      <div
        className={`hidden md:block fixed bottom-24 right-6 z-40 w-[400px] transition-all duration-300 ${
          isOpen && showButton
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="shadow-2xl rounded-xl">
          <ChatWindow
            embedded={false}
            showQuickActions={true}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </div>

      {/* Mobile: Overlay */}
      {isOpen && showButton && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile: Full-screen chat panel */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ${
          isOpen && showButton ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '85vh' }}
      >
        <div className="h-full bg-gray-950 rounded-t-xl">
          <ChatWindow
            embedded={false}
            showQuickActions={true}
            onClose={() => setIsOpen(false)}
            className="h-full rounded-t-xl rounded-b-none border-0"
          />
        </div>
      </div>
    </>
  )
}
