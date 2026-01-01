'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Panel types - single panel at a time
export type PanelType =
  | 'welcome'
  | 'recommendations'
  | 'providerDetail'
  | 'comparison'
  | 'coverage'
  | 'speedTest'
  | 'quiz'
  | 'addressAvailability'

export interface PanelConfig {
  type: PanelType
  data?: Record<string, unknown>
}

export interface ConversationContext {
  zipCode: string | null
  lastProvider: string | null // For provider detail panel
  mentionedProviders: string[]
  mentionedTechnologies: string[]
  comparisonRequested: boolean
  intent: 'explore' | 'compare' | 'recommend' | 'details' | 'speedtest' | 'quiz' | null
}

interface CommandCenterState {
  activePanel: PanelConfig
  context: ConversationContext
  mobileTab: 'chat' | 'panel'
}

interface CommandCenterContextType extends CommandCenterState {
  // Panel management - single panel
  showPanel: (type: PanelType, data?: Record<string, unknown>) => void
  goBack: () => void // Go back to recommendations or welcome

  // Context updates
  updateContext: (updates: Partial<ConversationContext>) => void
  setZipCode: (zip: string) => void

  // Layout
  setMobileTab: (tab: 'chat' | 'panel') => void

  // Process user message for panel triggers
  processMessage: (message: string) => void
}

const CommandCenterContext = createContext<CommandCenterContextType | null>(null)

// Provider name patterns for detection - expanded with slugs
const PROVIDER_PATTERNS = [
  { pattern: /\b(at&t|att)\b/i, name: 'AT&T', slug: 'att-internet' },
  { pattern: /\bspectrum\b/i, name: 'Spectrum', slug: 'spectrum' },
  { pattern: /\bxfinity\b/i, name: 'Xfinity', slug: 'xfinity' },
  { pattern: /\bfrontier\b/i, name: 'Frontier', slug: 'frontier' },
  { pattern: /\bt-mobile|tmobile\b/i, name: 'T-Mobile', slug: 't-mobile' },
  { pattern: /\bverizon\s*(fios)?\b/i, name: 'Verizon', slug: 'verizon-fios' },
  { pattern: /\bgoogle\s*fiber\b/i, name: 'Google Fiber', slug: 'google-fiber' },
  { pattern: /\bcox\b/i, name: 'Cox', slug: 'cox' },
  { pattern: /\bstarlink\b/i, name: 'Starlink', slug: 'starlink' },
  { pattern: /\boptimum\b/i, name: 'Optimum', slug: 'optimum' },
  { pattern: /\bcenturylink\b/i, name: 'CenturyLink', slug: 'centurylink' },
  { pattern: /\bwindstream\b/i, name: 'Windstream', slug: 'windstream' },
  { pattern: /\bmetronet\b/i, name: 'Metronet', slug: 'metronet' },
  { pattern: /\bziply\b/i, name: 'Ziply Fiber', slug: 'ziply-fiber' },
  { pattern: /\bbrightspeed\b/i, name: 'Brightspeed', slug: 'brightspeed' },
  { pattern: /\bbreezeline\b/i, name: 'Breezeline', slug: 'breezeline' },
  { pattern: /\bviasat\b/i, name: 'Viasat', slug: 'viasat' },
  { pattern: /\bhughesnet\b/i, name: 'HughesNet', slug: 'hughesnet' },
]

// Technology patterns
const TECH_PATTERNS = [
  { pattern: /\bfiber\b/i, tech: 'Fiber' },
  { pattern: /\bcable\b/i, tech: 'Cable' },
  { pattern: /\b5g\b/i, tech: '5G' },
  { pattern: /\bsatellite\b/i, tech: 'Satellite' },
  { pattern: /\bdsl\b/i, tech: 'DSL' },
]

export function CommandCenterProvider({ children }: { children: ReactNode }) {
  // Single active panel
  const [activePanel, setActivePanel] = useState<PanelConfig>({ type: 'welcome' })

  const [context, setContext] = useState<ConversationContext>({
    zipCode: null,
    lastProvider: null,
    mentionedProviders: [],
    mentionedTechnologies: [],
    comparisonRequested: false,
    intent: null,
  })

  const [mobileTab, setMobileTab] = useState<'chat' | 'panel'>('chat')

  // Show a panel (replaces current panel)
  const showPanel = useCallback((type: PanelType, data?: Record<string, unknown>) => {
    setActivePanel({ type, data })
    // Switch to panel tab on mobile when showing new panel
    setMobileTab('panel')
  }, [])

  // Go back to recommendations (if ZIP set) or welcome
  const goBack = useCallback(() => {
    if (context.zipCode) {
      setActivePanel({ type: 'recommendations', data: { zipCode: context.zipCode } })
    } else {
      setActivePanel({ type: 'welcome' })
    }
  }, [context.zipCode])

  // Update conversation context
  const updateContext = useCallback((updates: Partial<ConversationContext>) => {
    setContext(prev => ({ ...prev, ...updates }))
  }, [])

  // Set ZIP code and show recommendations
  const setZipCode = useCallback((zip: string) => {
    setContext(prev => {
      if (prev.zipCode === zip) return prev
      return { ...prev, zipCode: zip }
    })
    // Show recommendations panel
    setActivePanel({ type: 'recommendations', data: { zipCode: zip } })
    setMobileTab('panel')
  }, [])

  // Process a user message to detect intents and trigger panels
  const processMessage = useCallback((message: string) => {
    const lowerMessage = message.toLowerCase()

    // Detect ZIP code
    const zipMatch = message.match(/\b(\d{5})\b/)
    if (zipMatch && !context.zipCode) {
      setZipCode(zipMatch[1])
      return // ZIP detection is highest priority
    }

    // Detect providers mentioned
    const detectedProviders: { name: string; slug: string }[] = []
    for (const { pattern, name, slug } of PROVIDER_PATTERNS) {
      if (pattern.test(message)) {
        detectedProviders.push({ name, slug })
      }
    }

    // Detect technologies mentioned
    const mentionedTechnologies: string[] = []
    for (const { pattern, tech } of TECH_PATTERNS) {
      if (pattern.test(message)) {
        mentionedTechnologies.push(tech)
      }
    }

    // Update context with detected entities
    if (detectedProviders.length > 0 || mentionedTechnologies.length > 0) {
      setContext(prev => ({
        ...prev,
        mentionedProviders: [...new Set([...prev.mentionedProviders, ...detectedProviders.map(p => p.name)])],
        mentionedTechnologies: [...new Set([...prev.mentionedTechnologies, ...mentionedTechnologies])],
        lastProvider: detectedProviders.length > 0 ? detectedProviders[0].slug : prev.lastProvider,
      }))
    }

    // === INTENT DETECTION (in priority order) ===

    // 0. Address availability intent - detect street addresses
    const addressPattern = /(?:at|for|check|available|providers at|internet at)\s+(\d+\s+[\w\s]+(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|blvd|boulevard|way|ct|court|pl|place)[\w\s,]*)/i
    const addressMatch = message.match(addressPattern)
    if (addressMatch || /check.*address|my address|exact address|street address/i.test(lowerMessage)) {
      showPanel('addressAvailability', { address: addressMatch?.[1] || null })
      return
    }

    // 1. Speed test intent
    if (/speed\s*test|test.*speed|how fast|check.*speed|run.*test/i.test(lowerMessage)) {
      setContext(prev => ({ ...prev, intent: 'speedtest' }))
      showPanel('speedTest')
      return
    }

    // 2. Quiz/recommendation helper intent
    if (/quiz|help me (choose|pick|decide)|which (provider|one|internet)|recommend.*for me|what.*should.*get/i.test(lowerMessage)) {
      setContext(prev => ({ ...prev, intent: 'quiz' }))
      showPanel('quiz')
      return
    }

    // 3. Comparison intent (need 2 providers)
    if (/compare|vs\.?|versus|difference|better|which is/i.test(lowerMessage)) {
      const allProviders = [...context.mentionedProviders, ...detectedProviders.map(p => p.name)]
      const uniqueProviders = [...new Set(allProviders)]
      if (uniqueProviders.length >= 2) {
        setContext(prev => ({ ...prev, comparisonRequested: true, intent: 'compare' }))
        showPanel('comparison', { providers: uniqueProviders.slice(0, 2) })
        return
      }
    }

    // 4. Provider detail intent (asking about specific provider)
    if (detectedProviders.length === 1) {
      const provider = detectedProviders[0]
      // Check if asking about the provider specifically
      if (/about|tell me|info|plans|pricing|review|good|worth|details/i.test(lowerMessage)) {
        setContext(prev => ({ ...prev, intent: 'details', lastProvider: provider.slug }))
        showPanel('providerDetail', { providerSlug: provider.slug, providerName: provider.name })
        return
      }
    }

    // 5. Coverage/stats intent
    if (/coverage|available|statistics|how many|percent|what.*available/i.test(lowerMessage) && context.zipCode) {
      showPanel('coverage', { zipCode: context.zipCode })
      return
    }

    // 6. General recommendations (with ZIP)
    if (/recommend|suggest|best|options|show me|what.*have|providers/i.test(lowerMessage) && context.zipCode) {
      setContext(prev => ({ ...prev, intent: 'recommend' }))
      showPanel('recommendations', { zipCode: context.zipCode })
      return
    }

    // 7. If single provider mentioned without specific question, show detail
    if (detectedProviders.length === 1 && context.zipCode) {
      const provider = detectedProviders[0]
      setContext(prev => ({ ...prev, intent: 'details', lastProvider: provider.slug }))
      showPanel('providerDetail', { providerSlug: provider.slug, providerName: provider.name })
    }

  }, [context.zipCode, context.mentionedProviders, setZipCode, showPanel])

  return (
    <CommandCenterContext.Provider
      value={{
        activePanel,
        context,
        mobileTab,
        showPanel,
        goBack,
        updateContext,
        setZipCode,
        setMobileTab,
        processMessage,
      }}
    >
      {children}
    </CommandCenterContext.Provider>
  )
}

export function useCommandCenter() {
  const context = useContext(CommandCenterContext)
  if (!context) {
    throw new Error('useCommandCenter must be used within a CommandCenterProvider')
  }
  return context
}

// Safe version that returns null if not within CommandCenterProvider
export function useCommandCenterOptional() {
  return useContext(CommandCenterContext)
}
