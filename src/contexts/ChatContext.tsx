'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatContextType {
  messages: Message[]
  isOpen: boolean
  isLoading: boolean
  hasWelcomed: boolean
  pageContext: string
  chatSectionVisible: boolean
  sendMessage: (content: string, zipCode?: string) => Promise<void>
  initializeChat: (zipCode: string, city: string, providerCount?: number) => Promise<void>
  clearHistory: () => void
  setIsOpen: (open: boolean) => void
  setPageContext: (context: string) => void
  setChatSectionVisible: (visible: boolean) => void
  sendProactiveMessage: (pathname: string) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

const STORAGE_KEY = 'chat_messages'
const WELCOMED_KEY = 'chat_welcomed'
const WELCOMED_ZIP_KEY = 'chat_welcomed_zip'
const PROACTIVE_PAGES_KEY = 'chat_proactive_pages'

// Generate proactive message based on page type (no API call needed)
function getProactiveMessage(pathname: string): string | null {
  // Provider comparison pages
  if (pathname.startsWith('/compare/') && pathname.includes('-vs-')) {
    const comparison = pathname.split('/compare/')[1]
    const istech = comparison?.startsWith('technology/')
    const parts = comparison?.replace('technology/', '').split('-vs-')

    if (parts?.length === 2) {
      const provider1 = parts[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const provider2 = parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

      if (istech) {
        return `I see you're comparing ${provider1} vs ${provider2}! Below you'll find a detailed breakdown of each technology. Let me know if you have questions about which one is right for your needs.`
      }
      return `Great choice comparing ${provider1} and ${provider2}! Below you'll see a side-by-side comparison. I can help you decide which provider is better for your specific situation - just ask!`
    }
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

    return `You're viewing ${providerName}'s page. Below you'll find their plans, pricing, and coverage info. Want me to help you compare them to other providers in your area?`
  }

  // State/City pages
  if (pathname.startsWith('/internet/')) {
    const parts = pathname.split('/internet/')[1]?.split('/')
    if (parts?.length === 2) {
      const city = parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      return `Looking for internet in ${city}? Below you'll see providers available in your area. Let me know if you need help choosing the best option for your needs!`
    } else if (parts?.length === 1) {
      const state = parts[0].toUpperCase()
      return `Exploring internet options in ${state}? I can help you find the best providers and deals. What matters most to you - speed, price, or reliability?`
    }
  }

  // Guides page
  if (pathname === '/guides') {
    return `Welcome to our guides section! These articles will help you make informed decisions about your internet service. Have a specific question? I'm here to help!`
  }

  // Speed test page
  if (pathname === '/tools/speed-test') {
    return `Ready to test your internet speed? Run the test below and I can help you understand your results. If your speed seems slow, I can suggest ways to improve it!`
  }

  // Best/cheapest/fastest pages
  if (pathname.startsWith('/best/') || pathname.startsWith('/cheapest/') || pathname.startsWith('/fastest/')) {
    return `Below you'll find our top picks based on real data and customer reviews. Want personalized recommendations based on your location and needs? Just ask!`
  }

  // Deals page
  if (pathname === '/deals') {
    return `Looking for a great deal? Below are current promotions from top providers. I can help you find which offers are available at your address!`
  }

  return null
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasWelcomed, setHasWelcomed] = useState(false)
  const [welcomedZip, setWelcomedZip] = useState<string | null>(null)
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
  const resetForNewLocation = useCallback((newZip: string, newCity: string) => {
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
  const initializeChat = useCallback(async (zipCode: string, city: string, providerCount?: number) => {
    // If we already welcomed for a different ZIP, reset first
    if (welcomedZip && welcomedZip !== zipCode) {
      resetForNewLocation(zipCode, city)
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
        localStorage.setItem(WELCOMED_KEY, 'true')
        localStorage.setItem(WELCOMED_ZIP_KEY, zipCode)
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error)
      // Fallback welcome message
      const fallbackMessage = city
        ? `Hi! I'm your AI internet advisor. I see you're in ${city}. How can I help you find the perfect internet provider today?`
        : "Hi! I'm your AI internet advisor. Tell me your ZIP code or ask any question about internet providers!"

      setMessages([{ role: 'assistant', content: fallbackMessage }])
      setHasWelcomed(true)
      setWelcomedZip(zipCode)
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

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
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
    setProactivePages(new Set())
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(WELCOMED_KEY)
    localStorage.removeItem(WELCOMED_ZIP_KEY)
    localStorage.removeItem(PROACTIVE_PAGES_KEY)
  }, [])

  // Send proactive message when navigating to certain pages
  const sendProactiveMessage = useCallback((pathname: string) => {
    // Don't send if already sent for this page, or if no messages yet (wait for welcome)
    if (proactivePages.has(pathname) || messages.length === 0) {
      return
    }

    const message = getProactiveMessage(pathname)
    if (message) {
      // Add the proactive message
      setMessages(prev => [...prev, { role: 'assistant', content: message }])

      // Mark this page as having sent a proactive message
      const newProactivePages = new Set(proactivePages)
      newProactivePages.add(pathname)
      setProactivePages(newProactivePages)
      localStorage.setItem(PROACTIVE_PAGES_KEY, JSON.stringify([...newProactivePages]))
    }
  }, [proactivePages, messages.length])

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        hasWelcomed,
        pageContext,
        chatSectionVisible,
        sendMessage,
        initializeChat,
        clearHistory,
        setIsOpen,
        setPageContext,
        setChatSectionVisible,
        sendProactiveMessage,
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
