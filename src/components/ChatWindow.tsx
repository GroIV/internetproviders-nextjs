'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { useLocation } from '@/contexts/LocationContext'

interface QuickAction {
  label: string
  prompt: string
}

const defaultQuickActions: QuickAction[] = [
  { label: "Fastest options", prompt: "What's the fastest internet available in my area?" },
  { label: "Best value", prompt: "What's the best value internet plan here?" },
  { label: "Work from home", prompt: "Best internet for working from home?" },
  { label: "Gaming", prompt: "Which provider is best for online gaming?" },
  { label: "No contracts", prompt: "Any no-contract options available?" },
  { label: "Fiber availability", prompt: "Is fiber internet available here?" },
]

interface ChatWindowProps {
  embedded?: boolean // true for homepage (full height), false for floating panel
  showQuickActions?: boolean
  onClose?: () => void
  className?: string
}

export function ChatWindow({
  embedded = false,
  showQuickActions = true,
  onClose,
  className = ''
}: ChatWindowProps) {
  const { messages, isLoading, sendMessage, initializeChat, hasWelcomed } = useChat()
  const { location, isLoading: locationLoading } = useLocation()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize chat with welcome message when location is available
  useEffect(() => {
    if (location?.zipCode && location?.city && !hasWelcomed && !locationLoading) {
      initializeChat(location.zipCode, location.city)
    }
  }, [location, hasWelcomed, locationLoading, initializeChat])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input.trim(), location?.zipCode || undefined)
      setInput('')
    }
  }

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt, location?.zipCode || undefined)
  }

  // Focus input on mount for embedded mode
  useEffect(() => {
    if (embedded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [embedded])

  const containerHeight = embedded ? 'h-[60vh] min-h-[400px]' : 'h-[500px]'

  return (
    <div className={`flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden ${containerHeight} ${className}`}>
      {/* Header (for floating panel) */}
      {!embedded && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/95">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="font-medium text-white">AI Assistant</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            {locationLoading ? (
              <p className="text-gray-400">Detecting your location...</p>
            ) : (
              <>
                <p className="text-gray-400 mb-2">
                  {location?.city
                    ? `Hello from ${location.city}!`
                    : 'Welcome!'
                  }
                </p>
                <p className="text-gray-500 text-sm">
                  Loading your personalized assistant...
                </p>
              </>
            )}
          </div>
        ) : (
          messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showQuickActions && messages.length <= 1 && !isLoading && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {defaultQuickActions.slice(0, 4).map((action, i) => (
              <button
                key={i}
                onClick={() => handleQuickAction(action.prompt)}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about internet providers..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
