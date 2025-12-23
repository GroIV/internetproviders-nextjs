'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useChat } from '@/contexts/ChatContext'
import { ChatWindow } from './ChatWindow'

export function GlobalChat() {
  const pathname = usePathname()
  const { isOpen, setIsOpen, messages } = useChat()
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't show on homepage (chat is embedded there)
  if (pathname === '/') {
    return null
  }

  // Don't show on AI assistant page (redundant)
  if (pathname === '/tools/ai-assistant') {
    return null
  }

  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* Desktop: Always-visible sidebar */}
      <div className="hidden lg:block fixed right-0 top-16 bottom-0 w-[380px] border-l border-gray-800 bg-gray-950 z-40">
        <ChatWindow
          embedded={true}
          showQuickActions={true}
          className="h-full rounded-none border-0"
        />
      </div>

      {/* Desktop: Spacer to prevent content overlap */}
      <div className="hidden lg:block w-[380px] flex-shrink-0" />

      {/* Mobile/Tablet: Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
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
            {/* Message count badge */}
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {messages.length > 9 ? '9+' : messages.length}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Mobile: Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile: Full-screen chat panel */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '85vh' }}
      >
        <div className="h-full bg-gray-950 rounded-t-xl">
          <ChatWindow
            embedded={true}
            showQuickActions={true}
            onClose={() => setIsOpen(false)}
            className="h-full rounded-t-xl rounded-b-none"
          />
        </div>
      </div>
    </>
  )
}
