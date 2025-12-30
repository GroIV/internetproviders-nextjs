'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { ChatWindow } from '@/components/ChatWindow'
import { useChat } from '@/contexts/ChatContext'
import { useCommandCenter } from '@/contexts/CommandCenterContext'
import { useLocation } from '@/contexts/LocationContext'

export function ChatPanelEnhanced() {
  const { messages, hasWelcomed, initializeChat } = useChat()
  const { processMessage, setZipCode, context } = useCommandCenter()
  const { location } = useLocation()
  const [hasInitialized, setHasInitialized] = useState(false)
  const processedMessagesRef = useRef<Set<string>>(new Set())
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize chat when location is detected
  useEffect(() => {
    if (location?.zipCode && location?.city && !hasWelcomed && !hasInitialized) {
      // Clear fallback timer if location detected
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
      initializeChat(location.zipCode, location.city)
      setZipCode(location.zipCode)
      setHasInitialized(true)
    }
  }, [location?.zipCode, location?.city, hasWelcomed, hasInitialized, initializeChat, setZipCode])

  // Fallback greeting if location isn't detected within 2 seconds
  useEffect(() => {
    if (!hasWelcomed && !hasInitialized && messages.length === 0) {
      fallbackTimerRef.current = setTimeout(() => {
        // If still no welcome after 2 seconds, show a generic greeting
        if (!hasWelcomed && messages.length === 0) {
          // Use a generic location to trigger the greeting
          initializeChat('00000', '')
          setHasInitialized(true)
        }
      }, 2000)

      return () => {
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current)
        }
      }
    }
  }, [hasWelcomed, hasInitialized, messages.length, initializeChat])

  // Process USER messages for panel triggers (not AI messages - they shouldn't auto-trigger panels)
  const lastMessage = messages[messages.length - 1]
  const processUserMessage = useCallback((msg: typeof lastMessage) => {
    if (msg && msg.role === 'user') {
      // Create a unique key for this message
      const msgKey = `${msg.role}-${msg.content.substring(0, 50)}-${messages.length}`
      if (!processedMessagesRef.current.has(msgKey)) {
        processedMessagesRef.current.add(msgKey)
        processMessage(msg.content, false)
      }
    }
  }, [processMessage, messages.length])

  useEffect(() => {
    if (lastMessage && messages.length > 0) {
      processUserMessage(lastMessage)
    }
  }, [lastMessage, messages.length, processUserMessage])

  // Sync ZIP from location context to command center
  useEffect(() => {
    if (location?.zipCode && !context.zipCode) {
      setZipCode(location.zipCode)
    }
  }, [location?.zipCode, context.zipCode, setZipCode])

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">AI Internet Advisor</h2>
            <p className="text-xs text-gray-400">
              {context.zipCode ? `Helping with ZIP ${context.zipCode}` : 'Ready to help you find the best internet'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          embedded={true}
          showQuickActions={true}
          className="h-full"
        />
      </div>
    </div>
  )
}
