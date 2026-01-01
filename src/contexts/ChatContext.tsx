'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react'
import { getComparisonUrl, getSourceFromPathname } from '@/lib/affiliates'
import type { FeaturedPlan } from '@/lib/featuredPlans'

// Suggested plan type from API
export interface SuggestedPlan extends FeaturedPlan {
  providerName: string
  providerSlug: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  suggestedPlans?: SuggestedPlan[]
}

interface ChatContextType {
  messages: Message[]
  isOpen: boolean
  isLoading: boolean
  hasWelcomed: boolean
  pageContext: string
  chatSectionVisible: boolean
  currentZip: string | null
  sendMessage: (content: string, zipCode?: string) => Promise<void>
  initializeChat: (zipCode: string, city: string) => Promise<void>
  clearHistory: () => void
  setIsOpen: (open: boolean) => void
  setPageContext: (context: string) => void
  setChatSectionVisible: (visible: boolean) => void
  sendProactiveMessage: (pathname: string, freshZipCode?: string) => void
  updateCurrentZip: (zipCode: string) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

const STORAGE_KEY = 'chat_messages'
const WELCOMED_KEY = 'chat_welcomed'
const WELCOMED_ZIP_KEY = 'chat_welcomed_zip'
const PROACTIVE_PAGES_KEY = 'chat_proactive_pages'

// Generate proactive message based on page type (no API call needed)
// Uses affiliate order URLs so customers can check their actual address availability
function getProactiveMessage(pathname: string, knownZip?: string | null): string | null {
  // Get the affiliate order URL for this page context
  const source = getSourceFromPathname(pathname)
  const orderUrl = getComparisonUrl(source)

  // Provider comparison pages
  if (pathname.startsWith('/compare/') && pathname.includes('-vs-')) {
    const comparison = pathname.split('/compare/')[1]
    const istech = comparison?.startsWith('technology/')
    const parts = comparison?.replace('technology/', '').split('-vs-')

    if (parts?.length === 2) {
      const provider1 = parts[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const provider2 = parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

      if (istech) {
        return `Comparing ${provider1} vs ${provider2} - smart move! Check out the breakdown below. Ready to see what's actually available? [Check your address here](${orderUrl}) for real options and pricing!`
      }
      return `${provider1} vs ${provider2} - both solid choices! The comparison below shows general differences. Leaning toward one? [Check if they serve your address](${orderUrl}) to see actual plans and pricing!`
    }
  }

  // All providers listing page
  if (pathname === '/providers') {
    return `All the major providers are listed below! Instead of scrolling through everything, [check what's available at your exact address](${orderUrl}) - that's the fastest way to see real options and pricing!`
  }

  // Individual provider pages
  if (pathname.startsWith('/providers/')) {
    const slug = pathname.split('/providers/')[1]
    let providerName = slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    // Clean up common names
    if (slug === 'att-internet') providerName = 'AT&T'
    if (slug === 'verizon-fios') providerName = 'Verizon Fios'
    if (slug === 'spectrum') providerName = 'Spectrum'
    if (slug === 'xfinity') providerName = 'Xfinity'

    return `Looking at ${providerName}? Good choice! The info below is general - to see **exactly** what plans and speeds are available at YOUR address, [check availability here](${orderUrl}). Takes 30 seconds and shows you real pricing!`
  }

  // State/City pages
  if (pathname.startsWith('/internet/')) {
    const parts = pathname.split('/internet/')[1]?.split('/')
    if (parts?.length === 2) {
      const city = parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      return `Looking at providers in ${city}! This shows what's generally available, but availability varies by street. [Check your exact address here](${orderUrl}) to see real plans and pricing in seconds!`
    } else if (parts?.length === 1) {
      const state = parts[0].toUpperCase()
      return `Exploring internet in ${state}? These are the major providers here. The real question is which ones serve YOUR address - [check availability now](${orderUrl}) to find out instantly!`
    }
  }

  // Guides page
  if (pathname === '/guides') {
    return `Welcome to our guides section! These articles will help you make informed decisions about your internet service. Have a specific question? I'm here to help!`
  }

  // Individual guide pages
  if (pathname.startsWith('/guides/')) {
    return `I hope this guide is helpful! If you have questions about anything covered here, or need personalized advice, just ask me.`
  }

  // Tools main page
  if (pathname === '/tools') {
    return `Here are our helpful tools! Try the speed test to check your connection, or take the quiz to get personalized recommendations. Need help deciding which tool to use?`
  }

  // Speed test page
  if (pathname === '/tools/speed-test') {
    return `Ready to test your internet speed? Run the test below and I can help you understand your results. If your speed seems slow, I can suggest ways to improve it!`
  }

  // ISP Quiz page
  if (pathname === '/tools/quiz') {
    return `This quiz will help find your perfect internet match! Answer a few questions about your usage and I'll recommend the best options. Need help with any questions?`
  }

  // Compare main page (ZIP search)
  if (pathname === '/compare') {
    if (knownZip) {
      return `I've got your ZIP (${knownZip}) - you should see providers for your area below. **Pro tip:** [Check availability at your exact address](${orderUrl}) to see real pricing and plans. That's the only way to know 100% what you can get! Which provider catches your eye?`
    }
    return `Enter your ZIP code above to see providers in your area! Once you find one you like, [check your exact address](${orderUrl}) - that's where you'll see real plans and pricing.`
  }

  // Internet main page (all states)
  if (pathname === '/internet') {
    if (knownZip) {
      return `Browsing by state? I already have your ZIP (${knownZip}) - [check what's available at your address](${orderUrl}) to skip straight to real options and pricing!`
    }
    return `Browse internet availability by state! Or better yet, [check what's available at your exact address](${orderUrl}) to see real pricing and plans.`
  }

  // Best/cheapest/fastest pages
  if (pathname.startsWith('/best/') || pathname.startsWith('/cheapest/') || pathname.startsWith('/fastest/')) {
    return `Here are our top picks! These rankings are based on general performance, but the real question is what's available at YOUR address. [Check availability now](${orderUrl}) to see actual options and pricing for your location!`
  }

  // Deals page
  if (pathname === '/deals') {
    return `Hot deals below! These promotions look great, but availability varies by address. [Check what's available at your address](${orderUrl}) to see which deals you can actually get!`
  }

  // FAQ page
  if (pathname === '/faq') {
    return `Got questions? You're in the right place! Browse our FAQs below, or ask me directly - I might be able to help faster!`
  }

  // Contact page
  if (pathname === '/contact') {
    return `Need to get in touch? You can also ask me questions directly - I'm here to help with anything about internet providers!`
  }

  // About page
  if (pathname === '/about') {
    return `Thanks for wanting to learn more about us! If you have questions about how we can help you find internet service, just ask.`
  }

  return null
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasWelcomed, setHasWelcomed] = useState(false)
  const [welcomedZip, setWelcomedZip] = useState<string | null>(null)
  const [currentZip, setCurrentZip] = useState<string | null>(null) // Tracks the CURRENT location ZIP (may differ from welcomedZip)
  const [pageContext, setPageContext] = useState('')
  const [chatSectionVisible, setChatSectionVisible] = useState(true)
  const [proactivePages, setProactivePages] = useState<Set<string>>(new Set())
  const initializingRef = useRef(false)

  // Load from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(STORAGE_KEY)
    const storedWelcomed = localStorage.getItem(WELCOMED_KEY)
    const storedWelcomedZip = localStorage.getItem(WELCOMED_ZIP_KEY)
    const storedProactivePages = localStorage.getItem(PROACTIVE_PAGES_KEY)

    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages)
        setMessages(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    if (storedWelcomed === 'true') {
      setHasWelcomed(true)
    }

    if (storedWelcomedZip) {
      setWelcomedZip(storedWelcomedZip)
    }

    if (storedProactivePages) {
      try {
        const parsed = JSON.parse(storedProactivePages)
        setProactivePages(new Set(parsed))
      } catch {
        localStorage.removeItem(PROACTIVE_PAGES_KEY)
      }
    }
  }, [])

  // Save to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  // Reset chat when location changes significantly
  const resetForNewLocation = useCallback(() => {
    // Clear existing chat
    setMessages([])
    setHasWelcomed(false)
    setWelcomedZip(null)
    setProactivePages(new Set())
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(WELCOMED_KEY)
    localStorage.removeItem(WELCOMED_ZIP_KEY)
    localStorage.removeItem(PROACTIVE_PAGES_KEY)
    initializingRef.current = false
  }, [])

  // Initialize chat with welcome message
  const initializeChat = useCallback(async (zipCode: string, city: string) => {
    // If we already welcomed for a different ZIP, reset first
    if (welcomedZip && welcomedZip !== zipCode) {
      resetForNewLocation()
      // Small delay to let state update
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Prevent multiple initializations
    if (initializingRef.current || (hasWelcomed && welcomedZip === zipCode)) {
      return
    }

    initializingRef.current = true
    setIsLoading(true)

    try {
      // Call API to get personalized welcome message
      const response = await fetch('/api/chat/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode, city }),
      })

      const data = await response.json()

      if (data.message) {
        setMessages([{ role: 'assistant', content: data.message }])
        setHasWelcomed(true)
        setWelcomedZip(zipCode)
        setCurrentZip(zipCode) // Also set current ZIP
        localStorage.setItem(WELCOMED_KEY, 'true')
        localStorage.setItem(WELCOMED_ZIP_KEY, zipCode)
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error)
      // Fallback welcome message
      const orderUrl = getComparisonUrl('welcome')
      const fallbackMessage = city
        ? `Hi! I'm your AI internet advisor. I see you're in ${city}. I can help you compare plans, find deals, and [place your order online](${orderUrl}). What are you looking for?`
        : `Hi! I'm your AI internet advisor. I can help you compare providers and [place your order online](${orderUrl}). Tell me your ZIP code to get started!`

      setMessages([{ role: 'assistant', content: fallbackMessage }])
      setHasWelcomed(true)
      setWelcomedZip(zipCode)
      setCurrentZip(zipCode) // Also set current ZIP
      localStorage.setItem(WELCOMED_KEY, 'true')
      localStorage.setItem(WELCOMED_ZIP_KEY, zipCode)
    } finally {
      setIsLoading(false)
      initializingRef.current = false
    }
  }, [hasWelcomed, welcomedZip, resetForNewLocation])

  // Send a message
  const sendMessage = useCallback(async (content: string, zipCode?: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: content.trim() }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          zipCode,
          pageContext, // Include page context for relevant responses
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        suggestedPlans: data.suggestedPlans,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, pageContext])

  // Clear chat history
  const clearHistory = useCallback(() => {
    setMessages([])
    setHasWelcomed(false)
    setWelcomedZip(null)
    setCurrentZip(null)
    setProactivePages(new Set())
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(WELCOMED_KEY)
    localStorage.removeItem(WELCOMED_ZIP_KEY)
    localStorage.removeItem(PROACTIVE_PAGES_KEY)
  }, [])

  // Update current ZIP when location changes (e.g., GPS upgrade from IP)
  const updateCurrentZip = useCallback((zipCode: string) => {
    if (zipCode !== currentZip) {
      setCurrentZip(zipCode)
    }
  }, [currentZip])

  // Send proactive message when navigating to certain pages
  // freshZipCode: Pass the current location ZIP directly to avoid stale state issues
  const sendProactiveMessage = useCallback((pathname: string, freshZipCode?: string) => {
    // NEVER send proactive messages for homepage or AI assistant page
    if (pathname === '/' || pathname === '/tools/ai-assistant') {
      return
    }

    // Don't send if already sent for this page, or if no messages yet (wait for welcome)
    if (proactivePages.has(pathname) || messages.length === 0) {
      return
    }

    // DON'T interrupt active conversations!
    // If user has sent a message in the last 4 messages, they're engaged - don't interrupt
    const recentMessages = messages.slice(-4)
    const userMessagedRecently = recentMessages.some(m => m.role === 'user')
    if (userMessagedRecently) {
      // Still mark page as visited so we don't try again
      const newProactivePages = new Set(proactivePages)
      newProactivePages.add(pathname)
      setProactivePages(newProactivePages)
      localStorage.setItem(PROACTIVE_PAGES_KEY, JSON.stringify([...newProactivePages]))
      return
    }

    // Track page visit count for "need help finding something?" message
    const visitCount = proactivePages.size

    // Priority: freshZipCode (passed directly) > currentZip > welcomedZip
    // This ensures we always use the most up-to-date location
    const zipForMessage = freshZipCode || currentZip || welcomedZip
    const message = getProactiveMessage(pathname, zipForMessage)

    // After visiting 3+ pages without user interaction, push toward action
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user')
    const messagesSinceLastUser = lastUserMessageIndex === -1 ? messages.length : lastUserMessageIndex
    const shouldPushAction = visitCount >= 2 && messagesSinceLastUser >= 2

    // Get the affiliate order URL for push action messages
    const actionSource = getSourceFromPathname(pathname)
    const actionOrderUrl = getComparisonUrl(actionSource)

    let finalMessage = message
    if (shouldPushAction && message) {
      // After 3 pages, add a direct CTA
      if (visitCount >= 3) {
        finalMessage = message + `\n\n**Quick tip:** You've been checking out a few pages. The fastest way to get real answers is to [check what's available at your exact address](${actionOrderUrl}) - it takes 30 seconds and shows you actual plans and pricing. Want me to help you pick the best option?`
      } else {
        finalMessage = message + `\n\nReady to see what's actually available at your address? [Check availability now](${actionOrderUrl}) - it only takes a minute!`
      }
    } else if (shouldPushAction && !message) {
      // No page-specific message but they're bouncing around
      if (visitCount >= 4) {
        finalMessage = `Hey, I notice you've been doing some research. Let me cut to the chase - the only way to see exactly what's available at YOUR address with real pricing is to [check directly with providers](${actionOrderUrl}). It's free, takes 30 seconds, and you'll get actual answers instead of general info. Want me to recommend which provider to check first?`
      } else {
        finalMessage = `Looks like you're exploring your options! Instead of hunting around, [check what providers serve your exact address](${actionOrderUrl}) - you'll see real plans and pricing in seconds. I can help you compare once you know what's available!`
      }
    }

    if (finalMessage) {
      // Add the proactive message
      setMessages(prev => [...prev, { role: 'assistant', content: finalMessage }])

      // Mark this page as having sent a proactive message
      const newProactivePages = new Set(proactivePages)
      newProactivePages.add(pathname)
      setProactivePages(newProactivePages)
      localStorage.setItem(PROACTIVE_PAGES_KEY, JSON.stringify([...newProactivePages]))
    }
  }, [proactivePages, messages, welcomedZip, currentZip])

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        hasWelcomed,
        pageContext,
        chatSectionVisible,
        currentZip,
        sendMessage,
        initializeChat,
        clearHistory,
        setIsOpen,
        setPageContext,
        setChatSectionVisible,
        sendProactiveMessage,
        updateCurrentZip,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

// Safe version that returns null if not within ChatProvider
export function useChatOptional() {
  return useContext(ChatContext)
}
