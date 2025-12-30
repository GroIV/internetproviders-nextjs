'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Panel types
export type PanelType =
  | 'welcome'
  | 'recommendations'
  | 'comparison'
  | 'coverage'
  | 'speedPrice'

export interface PanelConfig {
  id: string
  type: PanelType
  data?: Record<string, unknown>
  priority: number
}

export interface ConversationContext {
  zipCode: string | null
  mentionedProviders: string[]
  mentionedTechnologies: string[]
  comparisonRequested: boolean
  intent: 'explore' | 'compare' | 'recommend' | 'details' | null
}

interface CommandCenterState {
  activePanels: PanelConfig[]
  context: ConversationContext
  layout: 'split' | 'stacked'
  mobileTab: 'chat' | 'panels'
}

interface CommandCenterContextType extends CommandCenterState {
  // Panel management
  showPanel: (type: PanelType, data?: Record<string, unknown>) => void
  hidePanel: (id: string) => void
  clearPanels: () => void

  // Context updates
  updateContext: (updates: Partial<ConversationContext>) => void
  setZipCode: (zip: string) => void

  // Layout
  setLayout: (layout: 'split' | 'stacked') => void
  setMobileTab: (tab: 'chat' | 'panels') => void

  // Process AI message for panel triggers
  processMessage: (message: string, isAI: boolean) => void
}

const CommandCenterContext = createContext<CommandCenterContextType | null>(null)

// Provider name patterns for detection
const PROVIDER_PATTERNS = [
  { pattern: /\b(at&t|att)\b/i, name: 'AT&T' },
  { pattern: /\bspectrum\b/i, name: 'Spectrum' },
  { pattern: /\bxfinity\b/i, name: 'Xfinity' },
  { pattern: /\bfrontier\b/i, name: 'Frontier' },
  { pattern: /\bt-mobile|tmobile\b/i, name: 'T-Mobile' },
  { pattern: /\bverizon\b/i, name: 'Verizon' },
  { pattern: /\bgoogle fiber\b/i, name: 'Google Fiber' },
  { pattern: /\bcox\b/i, name: 'Cox' },
  { pattern: /\bstarlink\b/i, name: 'Starlink' },
  { pattern: /\boptimum\b/i, name: 'Optimum' },
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
  const [activePanels, setActivePanels] = useState<PanelConfig[]>([
    { id: 'welcome-1', type: 'welcome', priority: 0 }
  ])

  const [context, setContext] = useState<ConversationContext>({
    zipCode: null,
    mentionedProviders: [],
    mentionedTechnologies: [],
    comparisonRequested: false,
    intent: null,
  })

  const [layout, setLayout] = useState<'split' | 'stacked'>('split')
  const [mobileTab, setMobileTab] = useState<'chat' | 'panels'>('chat')

  // Show a panel (adds to active panels, replaces existing of same type)
  const showPanel = useCallback((type: PanelType, data?: Record<string, unknown>) => {
    const id = `${type}-panel` // Consistent ID per type
    const priority = activePanels.length

    setActivePanels(prev => {
      // Remove existing panel of same type (replace it)
      const filtered = prev.filter(p => p.type !== type)
      return [...filtered, { id, type, data, priority }]
    })
  }, [activePanels.length])

  // Hide a specific panel
  const hidePanel = useCallback((id: string) => {
    setActivePanels(prev => prev.filter(p => p.id !== id))
  }, [])

  // Clear all panels (show welcome)
  const clearPanels = useCallback(() => {
    setActivePanels([{ id: 'welcome-1', type: 'welcome', priority: 0 }])
  }, [])

  // Update conversation context
  const updateContext = useCallback((updates: Partial<ConversationContext>) => {
    setContext(prev => ({ ...prev, ...updates }))
  }, [])

  // Set ZIP code and trigger recommendations (idempotent - won't duplicate)
  const setZipCode = useCallback((zip: string) => {
    setContext(prev => {
      // Skip if ZIP is already set to this value
      if (prev.zipCode === zip) return prev
      return { ...prev, zipCode: zip }
    })

    // When ZIP is set, show recommendations panel (only one)
    setActivePanels(prev => {
      // Don't add if we already have a recommendations panel
      if (prev.some(p => p.type === 'recommendations')) {
        return prev
      }
      const filtered = prev.filter(p => p.type !== 'welcome')
      return [...filtered, {
        id: 'recommendations-panel',
        type: 'recommendations',
        data: { zipCode: zip },
        priority: 1
      }]
    })

    // Switch to panels tab on mobile
    setMobileTab('panels')
  }, [])

  // Process a message to detect intents and trigger panels
  const processMessage = useCallback((message: string, isAI: boolean) => {
    const lowerMessage = message.toLowerCase()

    // Detect ZIP code
    const zipMatch = message.match(/\b(\d{5})\b/)
    if (zipMatch && !context.zipCode) {
      setZipCode(zipMatch[1])
    }

    // Detect providers mentioned
    const mentionedProviders: string[] = []
    for (const { pattern, name } of PROVIDER_PATTERNS) {
      if (pattern.test(message)) {
        mentionedProviders.push(name)
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
    if (mentionedProviders.length > 0 || mentionedTechnologies.length > 0) {
      setContext(prev => ({
        ...prev,
        mentionedProviders: [...new Set([...prev.mentionedProviders, ...mentionedProviders])],
        mentionedTechnologies: [...new Set([...prev.mentionedTechnologies, ...mentionedTechnologies])],
      }))
    }

    // Detect comparison intent
    if (/compare|vs|versus|difference|better/i.test(lowerMessage)) {
      const providers = [...context.mentionedProviders, ...mentionedProviders]
      if (providers.length >= 2) {
        setContext(prev => ({ ...prev, comparisonRequested: true, intent: 'compare' }))
        showPanel('comparison', { providers: providers.slice(0, 2) })
      }
    }

    // Detect recommendation intent
    if (/recommend|suggest|best|options|available|show me/i.test(lowerMessage) && context.zipCode) {
      setContext(prev => ({ ...prev, intent: 'recommend' }))
      showPanel('recommendations', { zipCode: context.zipCode })
    }

    // Detect coverage/stats intent
    if (/coverage|available|statistics|how many|percent/i.test(lowerMessage) && context.zipCode) {
      showPanel('coverage', { zipCode: context.zipCode })
    }

    // Detect value/price analysis intent
    if (/value|price|cheap|budget|worth|speed per dollar/i.test(lowerMessage) && context.zipCode) {
      showPanel('speedPrice', { zipCode: context.zipCode })
    }
  }, [context.zipCode, context.mentionedProviders, setZipCode, showPanel])

  return (
    <CommandCenterContext.Provider
      value={{
        activePanels,
        context,
        layout,
        mobileTab,
        showPanel,
        hidePanel,
        clearPanels,
        updateContext,
        setZipCode,
        setLayout,
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
