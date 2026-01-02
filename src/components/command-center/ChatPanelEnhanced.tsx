'use client'

import { useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChatWindow } from '@/components/ChatWindow'
import { useChat } from '@/contexts/ChatContext'
import { useCommandCenter } from '@/contexts/CommandCenterContext'
import { useLocation } from '@/contexts/LocationContext'

// Quick action chip component
function QuickActionChip({
  icon,
  label,
  onClick,
  gradient
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  gradient: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${gradient} shadow-lg hover:shadow-xl transition-shadow`}
    >
      {icon}
      {label}
    </motion.button>
  )
}

export function ChatPanelEnhanced() {
  const { messages, hasWelcomed, initializeChat, updateCurrentZip } = useChat()
  const { processMessage, setZipCode, context, showPanel } = useCommandCenter()
  const { location } = useLocation()
  const hasInitializedRef = useRef(false)
  const processedMessagesRef = useRef<Set<string>>(new Set())
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize chat when location is detected
  useEffect(() => {
    if (location?.zipCode && location?.city && !hasWelcomed && !hasInitializedRef.current) {
      // Clear fallback timer if location detected
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
      initializeChat(location.zipCode, location.city)
      setZipCode(location.zipCode)
      hasInitializedRef.current = true
    }
  }, [location?.zipCode, location?.city, hasWelcomed, initializeChat, setZipCode])

  // Fallback greeting if location isn't detected within 2 seconds
  useEffect(() => {
    if (!hasWelcomed && !hasInitializedRef.current && messages.length === 0) {
      fallbackTimerRef.current = setTimeout(() => {
        // If still no welcome after 2 seconds, show a generic greeting
        if (!hasWelcomed && messages.length === 0 && !hasInitializedRef.current) {
          // Use a generic location to trigger the greeting
          initializeChat('00000', '')
          hasInitializedRef.current = true
        }
      }, 2000)

      return () => {
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current)
        }
      }
    }
  }, [hasWelcomed, messages.length, initializeChat])

  // Process USER messages for panel triggers (not AI messages - they shouldn't auto-trigger panels)
  const lastMessage = messages[messages.length - 1]
  const processUserMessage = useCallback((msg: typeof lastMessage) => {
    if (msg && msg.role === 'user') {
      // Create a unique key for this message
      const msgKey = `${msg.role}-${msg.content.substring(0, 50)}-${messages.length}`
      if (!processedMessagesRef.current.has(msgKey)) {
        processedMessagesRef.current.add(msgKey)
        processMessage(msg.content)
      }
    }
  }, [processMessage, messages.length])

  useEffect(() => {
    if (lastMessage && messages.length > 0) {
      processUserMessage(lastMessage)
    }
  }, [lastMessage, messages.length, processUserMessage])

  // Sync ZIP from location context to command center and chat (always keep in sync)
  useEffect(() => {
    if (location?.zipCode) {
      // Update command center if different
      if (location.zipCode !== context.zipCode) {
        setZipCode(location.zipCode)
      }
      // Always update chat context's current ZIP
      updateCurrentZip(location.zipCode)
    }
  }, [location?.zipCode, context.zipCode, setZipCode, updateCurrentZip])

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

      {/* Quick Action Chips - Try these to see panel update */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-800/30 bg-gray-900/50">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-[10px] text-gray-500 uppercase tracking-wide flex-shrink-0">Try:</span>

          <QuickActionChip
            icon={
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            label="Speed Test"
            onClick={() => showPanel('speedTest')}
            gradient="from-purple-500 to-pink-500"
          />

          <QuickActionChip
            icon={
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            label="Coverage"
            onClick={() => showPanel('coverage', { zipCode: context.zipCode })}
            gradient="from-green-500 to-emerald-500"
          />

          {context.zipCode && (
            <QuickActionChip
              icon={
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              label="Providers"
              onClick={() => showPanel('recommendations', { zipCode: context.zipCode })}
              gradient="from-cyan-500 to-blue-500"
            />
          )}
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
