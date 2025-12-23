'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const suggestedQuestions = [
  'What internet speed do I need for streaming?',
  'Fiber vs Cable - which is better?',
  'How can I improve my WiFi signal?',
  'What is latency and why does it matter?',
]

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [zipCode, setZipCode] = useState('')
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'detected' | 'failed'>('idle')
  const [cityName, setCityName] = useState('')
  const [isPrecise, setIsPrecise] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-detect location on mount - try both IP and browser geolocation
  useEffect(() => {
    const detectLocation = async () => {
      // Skip if already have a ZIP
      if (zipCode) return

      setLocationStatus('detecting')

      // Start IP geolocation (fast, no permission needed)
      const ipPromise = fetch('/api/location')
        .then(res => res.json())
        .catch(() => null)

      // Start browser geolocation simultaneously (may show permission prompt)
      let browserResult: { zipCode: string; city: string } | null = null
      const browserPromise = new Promise<{ zipCode: string; city: string } | null>((resolve) => {
        if (!navigator.geolocation) {
          resolve(null)
          return
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords
              const geoResponse = await fetch(
                `/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`
              )
              const geoData = await geoResponse.json()

              if (geoData.success && geoData.location?.zipCode) {
                resolve({
                  zipCode: geoData.location.zipCode,
                  city: geoData.location.city || '',
                })
              } else {
                resolve(null)
              }
            } catch {
              resolve(null)
            }
          },
          () => resolve(null), // User denied or error
          { enableHighAccuracy: true, timeout: 10000 }
        )
      })

      // Use IP result immediately if available
      const ipData = await ipPromise
      if (ipData?.success && ipData.location?.zipCode) {
        setZipCode(ipData.location.zipCode)
        setCityName(ipData.location.city || '')
        setLocationStatus('detected')
      }

      // Wait for browser geolocation - if it succeeds, update to precise location
      browserResult = await browserPromise
      if (browserResult) {
        setZipCode(browserResult.zipCode)
        setCityName(browserResult.city)
        setIsPrecise(true)
        setLocationStatus('detected')
      } else if (!ipData?.success) {
        // Both failed
        setLocationStatus('failed')
      }
    }

    detectLocation()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Function to request precise browser geolocation
  const requestPreciseLocation = async () => {
    if (!navigator.geolocation) {
      return
    }

    setLocationStatus('detecting')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const geoResponse = await fetch(
            `/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`
          )
          const geoData = await geoResponse.json()

          if (geoData.success && geoData.location?.zipCode) {
            setZipCode(geoData.location.zipCode)
            setCityName(geoData.location.city || '')
            setIsPrecise(true)
            setLocationStatus('detected')
          } else {
            setLocationStatus('detected') // Keep previous location
          }
        } catch {
          setLocationStatus('detected') // Keep previous location
        }
      },
      () => {
        // User denied - keep existing location
        setLocationStatus('detected')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: content.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Check for ZIP code in message
    const zipMatch = content.match(/\b\d{5}\b/)
    if (zipMatch && !zipCode) {
      setZipCode(zipMatch[0])
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          zipCode: zipCode || zipMatch?.[0],
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
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-white">Tools</Link>
          <span className="mx-2">/</span>
          <span className="text-white">AI Assistant</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">AI Internet Assistant</h1>
          <p className="text-gray-400">
            Ask me anything about internet providers, speeds, and technology
          </p>
        </div>

        {/* ZIP Code Input */}
        <div className="mb-4 flex items-center justify-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Your ZIP:</span>
          <input
            type="text"
            maxLength={5}
            placeholder={locationStatus === 'detecting' ? 'Detecting...' : 'Enter ZIP'}
            value={zipCode}
            onChange={(e) => {
              setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))
              setCityName('') // Clear city name when manually entering
              setIsPrecise(false)
            }}
            className="w-24 px-3 py-1 bg-gray-800 border border-gray-700 rounded text-center text-sm focus:outline-none focus:border-blue-500"
          />
          {locationStatus === 'detecting' && (
            <span className="text-yellow-400 text-sm flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Detecting location...
            </span>
          )}
          {zipCode.length === 5 && locationStatus !== 'detecting' && (
            <span className="text-green-400 text-sm">
              {cityName ? `${cityName}` : 'Ready'}
              {isPrecise && ' (precise)'}
            </span>
          )}
          {zipCode.length === 5 && locationStatus !== 'detecting' && !isPrecise && (
            <button
              onClick={requestPreciseLocation}
              className="text-xs text-blue-400 hover:text-blue-300 underline"
              title="Use browser location for more accurate results"
            >
              Use precise location
            </button>
          )}
        </div>

        {/* Chat Container */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-gray-400 mb-6">How can I help you today?</p>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                  {suggestedQuestions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(question)}
                      className="text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg px-4 py-2">
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

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about internet providers, speeds, technology..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/tools/speed-test"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Test Your Speed
          </Link>
          <Link
            href="/tools/quiz"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Take the Quiz
          </Link>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Compare Providers
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          AI responses are for informational purposes. Always verify current pricing and availability with providers.
        </p>
      </div>
    </div>
  )
}
