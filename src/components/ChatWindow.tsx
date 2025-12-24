'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { usePathname } from 'next/navigation'
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

// Get page-specific context and quick actions based on current route
function getPageContext(pathname: string): { context: string; quickActions?: QuickAction[] } {
  // Provider page
  if (pathname.startsWith('/providers/')) {
    const slug = pathname.split('/providers/')[1]
    const providerName = slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    return {
      context: `User is viewing the ${providerName} provider page. They may have questions about this specific provider's plans, pricing, coverage, or how it compares to others.`,
      quickActions: [
        { label: `${providerName} plans`, prompt: `What plans does ${providerName} offer?` },
        { label: "Pricing", prompt: `How much does ${providerName} cost per month?` },
        { label: "Pros & cons", prompt: `What are the pros and cons of ${providerName}?` },
        { label: "Alternatives", prompt: `What are some alternatives to ${providerName}?` },
      ]
    }
  }

  // Comparison page
  if (pathname.startsWith('/compare/') && pathname.includes('-vs-')) {
    const comparison = pathname.split('/compare/')[1]
    const providers = comparison?.replace('technology/', '').split('-vs-').map(p =>
      p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    )
    if (providers?.length === 2) {
      return {
        context: `User is comparing ${providers[0]} vs ${providers[1]}. Help them understand the differences and which might be better for their needs.`,
        quickActions: [
          { label: "Which is faster?", prompt: `Which is faster, ${providers[0]} or ${providers[1]}?` },
          { label: "Which is cheaper?", prompt: `Which is more affordable, ${providers[0]} or ${providers[1]}?` },
          { label: "Best for gaming", prompt: `For gaming, should I choose ${providers[0]} or ${providers[1]}?` },
          { label: "My recommendation", prompt: `Based on my location, which do you recommend?` },
        ]
      }
    }
  }

  // Guides page
  if (pathname === '/guides') {
    return {
      context: `User is browsing internet guides and articles. Help them find relevant information about internet service.`,
      quickActions: [
        { label: "Speed guide", prompt: "What internet speed do I need?" },
        { label: "Save money", prompt: "How can I save money on internet?" },
        { label: "Fiber vs Cable", prompt: "Should I get fiber or cable internet?" },
        { label: "Work from home", prompt: "Best internet setup for remote work?" },
      ]
    }
  }

  // Guide detail page
  if (pathname.startsWith('/guides/')) {
    const slug = pathname.split('/guides/')[1]
    const title = slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    return {
      context: `User is reading a guide about "${title}". Answer questions related to this topic.`,
    }
  }

  // State/City pages
  if (pathname.startsWith('/internet/')) {
    const parts = pathname.split('/internet/')[1]?.split('/')
    if (parts?.length === 2) {
      const city = parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const state = parts[0].toUpperCase()
      return {
        context: `User is viewing internet providers in ${city}, ${state}. Help them find the best options in this area.`,
        quickActions: [
          { label: "Best provider", prompt: `What's the best internet provider in ${city}?` },
          { label: "Fiber available?", prompt: `Is fiber internet available in ${city}?` },
          { label: "Cheapest option", prompt: `What's the cheapest internet in ${city}?` },
          { label: "Coverage", prompt: `How is internet coverage in ${city}?` },
        ]
      }
    }
  }

  // FAQ page
  if (pathname === '/faq') {
    return {
      context: `User is on the FAQ page. Help answer common questions about internet service.`,
    }
  }

  // Speed test page
  if (pathname === '/tools/speed-test') {
    return {
      context: `User is on the speed test page. Help them understand their results or troubleshoot speed issues.`,
      quickActions: [
        { label: "Good speed?", prompt: "What's considered a good internet speed?" },
        { label: "Slow internet", prompt: "Why is my internet so slow?" },
        { label: "Improve speed", prompt: "How can I improve my internet speed?" },
        { label: "Upload vs download", prompt: "What's the difference between upload and download speed?" },
      ]
    }
  }

  // Default for other pages
  return { context: '' }
}

interface ChatWindowProps {
  embedded?: boolean // true for prominent display, false for floating panel
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
  const pathname = usePathname()
  const { messages, isLoading, sendMessage, initializeChat, hasWelcomed, setPageContext } = useChat()
  const { location, isLoading: locationLoading } = useLocation()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const prevMessagesLength = useRef(messages.length)
  const prevPathname = useRef(pathname)
  const shouldScrollOnNextMessage = useRef(false)

  // Get page-specific context
  const pageInfo = getPageContext(pathname)

  // Update page context when route changes
  useEffect(() => {
    setPageContext(pageInfo.context)
  }, [pathname, pageInfo.context, setPageContext])

  // Track page changes - scroll to bottom immediately and set flag for next message
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      shouldScrollOnNextMessage.current = true
      prevPathname.current = pathname

      // Immediately scroll to bottom when page changes (to show existing messages)
      if (messages.length > 0) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [pathname, messages.length])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const hasNewMessages = messages.length > prevMessagesLength.current

    // Scroll if: user interacted, OR we're expecting a scroll after navigation
    if (hasNewMessages && (hasInteracted || shouldScrollOnNextMessage.current)) {
      // Small delay to ensure DOM has updated after message render
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
      shouldScrollOnNextMessage.current = false // Reset after scrolling
    }

    prevMessagesLength.current = messages.length
  }, [messages, hasInteracted])

  // Initialize chat with welcome message when location is available
  useEffect(() => {
    if (location?.zipCode && location?.city && !hasWelcomed && !locationLoading) {
      initializeChat(location.zipCode, location.city)
    }
  }, [location, hasWelcomed, locationLoading, initializeChat])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      setHasInteracted(true)
      sendMessage(input.trim(), location?.zipCode || undefined)
      setInput('')
    }
  }

  const handleQuickAction = (prompt: string) => {
    setHasInteracted(true)
    sendMessage(prompt, location?.zipCode || undefined)
  }

  // Don't auto-focus to prevent scroll jump
  // User can click to focus

  const containerHeight = embedded ? 'h-[60vh] min-h-[400px]' : 'h-[500px]'

  // Use page-specific quick actions if available, otherwise defaults
  const activeQuickActions = pageInfo.quickActions || defaultQuickActions

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
            {activeQuickActions.slice(0, 4).map((action, i) => (
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
