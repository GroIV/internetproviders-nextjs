'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@/contexts/ChatContext'
import { useLocation } from '@/contexts/LocationContext'
import { AIAvatar, ThinkingIndicator, TypewriterText, QuickActionButton, MarkdownContent } from './chat'

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

// Message animation variants
const messageVariants = {
  hidden: (isUser: boolean) => ({
    opacity: 0,
    x: isUser ? 30 : -30,
    scale: 0.95,
  }),
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    }
  }
}

interface ChatWindowProps {
  embedded?: boolean
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
  const [isFocused, setIsFocused] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const prevMessagesLength = useRef(messages.length)
  const prevPathname = useRef(pathname)
  const shouldScrollOnNextMessage = useRef(false)
  const [revealedMessages, setRevealedMessages] = useState<Set<number>>(new Set())

  // Helper to scroll chat to bottom without affecting page scroll
  const scrollChatToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant'
      })
    }
  }

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

      if (messages.length > 0) {
        setTimeout(() => scrollChatToBottom(), 100)
      }
    }
  }, [pathname, messages.length])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const hasNewMessages = messages.length > prevMessagesLength.current

    if (hasNewMessages && (hasInteracted || shouldScrollOnNextMessage.current)) {
      setTimeout(() => scrollChatToBottom(), 50)
      shouldScrollOnNextMessage.current = false
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
      setJustSent(true)
      sendMessage(input.trim(), location?.zipCode || undefined)
      setInput('')
      setTimeout(() => setJustSent(false), 400)
    }
  }

  const handleQuickAction = (prompt: string) => {
    setHasInteracted(true)
    sendMessage(prompt, location?.zipCode || undefined)
  }

  const handleTypewriterComplete = (index: number) => {
    setRevealedMessages(prev => new Set([...prev, index]))
    scrollChatToBottom()
  }

  const containerHeight = embedded ? 'h-[60vh] min-h-[400px]' : 'h-[500px]'
  const activeQuickActions = pageInfo.quickActions || defaultQuickActions

  return (
    <div className={`relative ${containerHeight} ${className}`}>
      {/* Aurora background layer */}
      <div className="absolute inset-0 aurora-bg rounded-2xl pointer-events-none" />

      {/* Main container with glassmorphism */}
      <div
        className={`
          relative flex flex-col h-full
          glass-container glow-border rounded-2xl overflow-hidden
          ${isLoading ? 'chat-glow-thinking' : 'chat-glow'}
        `}
      >
        {/* Header (for floating panel) */}
        {!embedded && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <AIAvatar mood={isLoading ? 'thinking' : 'neutral'} isThinking={isLoading} size="sm" />
              <div>
                <span className="font-medium text-white">AI Assistant</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
            </div>
            {onClose && (
              <motion.button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </div>
        )}

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AIAvatar mood="helpful" size="lg" className="mx-auto mb-4" />
              {locationLoading ? (
                <p className="text-gray-400">Detecting your location...</p>
              ) : (
                <>
                  <p className="text-gray-300 mb-2 font-medium">
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
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message, i) => {
                const isUser = message.role === 'user'
                const isNewMessage = i === messages.length - 1 && !revealedMessages.has(i)
                const shouldTypewrite = !isUser && isNewMessage && message.content.length < 500

                return (
                  <motion.div
                    key={i}
                    custom={isUser}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* AI Avatar for assistant messages */}
                    {!isUser && (
                      <div className="flex-shrink-0 mr-2">
                        <AIAvatar mood="neutral" size="sm" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-gray-800/80 backdrop-blur-sm text-gray-200 border border-gray-700/50'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {shouldTypewrite ? (
                          <TypewriterText
                            content={message.content}
                            speed={12}
                            onComplete={() => handleTypewriterComplete(i)}
                          />
                        ) : (
                          <MarkdownContent content={message.content} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}

          {/* Loading Indicator */}
          <AnimatePresence>
            {isLoading && <ThinkingIndicator />}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <AnimatePresence>
          {showQuickActions && messages.length <= 1 && !isLoading && (
            <motion.div
              className="px-4 pb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-wrap gap-2">
                {activeQuickActions.slice(0, 4).map((action, i) => (
                  <QuickActionButton
                    key={action.label}
                    label={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    index={i}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700/50">
          <div className="relative">
            {/* Focus glow effect */}
            <motion.div
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600"
              initial={false}
              animate={{
                opacity: isFocused ? 0.3 : 0,
              }}
              transition={{ duration: 0.2 }}
            />

            <div className="relative flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask about internet providers..."
                className={`
                  flex-1 px-4 py-3
                  bg-gray-800/80 backdrop-blur-sm
                  border rounded-xl
                  text-white placeholder-gray-500
                  transition-all duration-200
                  focus:outline-none
                  ${isFocused ? 'border-blue-500/50 input-glow' : 'border-gray-700/50'}
                `}
                disabled={isLoading}
              />

              <motion.button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`
                  relative px-4 py-3 rounded-xl font-medium overflow-hidden
                  transition-all duration-200
                  ${!input.trim() || isLoading
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40'
                  }
                `}
                whileHover={input.trim() && !isLoading ? { scale: 1.02 } : {}}
                whileTap={input.trim() && !isLoading ? { scale: 0.98 } : {}}
              >
                {/* Success ripple */}
                <AnimatePresence>
                  {justSent && (
                    <motion.span
                      className="absolute inset-0 bg-green-500/50 rounded-xl"
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </AnimatePresence>

                <motion.svg
                  className="w-5 h-5 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={justSent ? { x: [0, 5, 0], y: [0, -5, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </motion.svg>
              </motion.button>
            </div>
          </div>

          {/* Typing hint */}
          <AnimatePresence>
            {input.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-xs text-gray-500 text-center"
              >
                Press Enter to send
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}
