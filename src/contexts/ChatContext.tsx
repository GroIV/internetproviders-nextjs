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
  sendMessage: (content: string, zipCode?: string) => Promise<void>
  initializeChat: (zipCode: string, city: string, providerCount?: number) => Promise<void>
  clearHistory: () => void
  setIsOpen: (open: boolean) => void
  setPageContext: (context: string) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

const STORAGE_KEY = 'chat_messages'
const WELCOMED_KEY = 'chat_welcomed'

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasWelcomed, setHasWelcomed] = useState(false)
  const [pageContext, setPageContext] = useState('')
  const initializingRef = useRef(false)

  // Load from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(STORAGE_KEY)
    const storedWelcomed = localStorage.getItem(WELCOMED_KEY)

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
  }, [])

  // Save to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  // Initialize chat with welcome message
  const initializeChat = useCallback(async (zipCode: string, city: string, providerCount?: number) => {
    // Prevent multiple initializations
    if (initializingRef.current || hasWelcomed || messages.length > 0) {
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
        localStorage.setItem(WELCOMED_KEY, 'true')
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error)
      // Fallback welcome message
      const fallbackMessage = city
        ? `Hi! I'm your AI internet advisor. I see you're in ${city}. How can I help you find the perfect internet provider today?`
        : "Hi! I'm your AI internet advisor. Tell me your ZIP code or ask any question about internet providers!"

      setMessages([{ role: 'assistant', content: fallbackMessage }])
      setHasWelcomed(true)
      localStorage.setItem(WELCOMED_KEY, 'true')
    } finally {
      setIsLoading(false)
      initializingRef.current = false
    }
  }, [hasWelcomed, messages.length])

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
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(WELCOMED_KEY)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        hasWelcomed,
        pageContext,
        sendMessage,
        initializeChat,
        clearHistory,
        setIsOpen,
        setPageContext,
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
