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

  // All providers listing page
  if (pathname === '/providers') {
    return `Here's our complete list of internet providers! You can browse by name or type. Want me to help narrow down which providers are available at your address?`
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
    return `Enter your ZIP code above to see all providers available at your address! I can help you compare plans once you see your options.`
  }

  // Internet main page (all states)
  if (pathname === '/internet') {
    return `Browse internet availability by state! Select your state to see providers and coverage in your area. Or just tell me your ZIP code and I'll find providers for you.`
  }

  // Best/cheapest/fastest pages
  if (pathname.startsWith('/best/') || pathname.startsWith('/cheapest/') || pathname.startsWith('/fastest/')) {
    return `Below you'll find our top picks based on real data and customer reviews. Want personalized recommendations based on your location and needs? Just ask!`
  }

  // Deals page
  if (pathname === '/deals') {
    return `Looking for a great deal? Below are current promotions from top providers. I can help you find which offers are available at your address!`
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
    // NEVER send proactive messages for homepage or AI assistant page
    if (pathname === '/' || pathname === '/tools/ai-assistant') {
      return
    }

    // Don't send if already sent for this page, or if no messages yet (wait for welcome)
    if (proactivePages.has(pathname) || messages.length === 0) {
      return
    }

    // Track page visit count for "need help finding something?" message
    const visitCount = proactivePages.size

    const message = getProactiveMessage(pathname)

    // After visiting 4+ pages without user interaction, offer extra help
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user')
    const messagesSinceLastUser = lastUserMessageIndex === -1 ? messages.length : lastUserMessageIndex
    const shouldOfferHelp = visitCount >= 3 && messagesSinceLastUser >= 3

    let finalMessage = message
    if (shouldOfferHelp && message) {
      finalMessage = message + "\n\nI notice you've been exploring a few pages. Need help finding something specific? I'm happy to point you in the right direction!"
    } else if (shouldOfferHelp && !message) {
      finalMessage = "I notice you've been exploring the site. Need help finding something specific? Whether it's comparing providers, checking availability, or finding the best deal - just ask!"
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
  }, [proactivePages, messages])

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
