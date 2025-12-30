'use client'

import { AnimatePresence } from 'framer-motion'
import { CommandCenterProvider, useCommandCenter } from '@/contexts/CommandCenterContext'
import { CommandCenterLayout } from './CommandCenterLayout'
import { ChatPanelEnhanced } from './ChatPanelEnhanced'
import {
  WelcomePanel,
  ProviderRecommendationsPanel,
  CoverageStatsPanel,
  PlanComparisonPanel,
} from './panels'

// Panel renderer based on type
function DynamicPanel({ panel }: { panel: { id: string; type: string; data?: Record<string, unknown> } }) {
  switch (panel.type) {
    case 'welcome':
      return <WelcomePanel key={panel.id} />
    case 'recommendations':
      return <ProviderRecommendationsPanel key={panel.id} data={panel.data as { zipCode?: string }} />
    case 'coverage':
      return <CoverageStatsPanel key={panel.id} data={panel.data as { zipCode?: string }} />
    case 'comparison':
      return <PlanComparisonPanel key={panel.id} data={panel.data as { providers?: string[] }} />
    default:
      return null
  }
}

function DynamicPanelsGrid() {
  const { activePanels } = useCommandCenter()

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {activePanels.map((panel) => (
          <DynamicPanel key={panel.id} panel={panel} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function CommandCenterContent() {
  return (
    <CommandCenterLayout
      chatPanel={<ChatPanelEnhanced />}
      dynamicPanels={<DynamicPanelsGrid />}
    />
  )
}

export function CommandCenterClient() {
  return (
    <CommandCenterProvider>
      <CommandCenterContent />
    </CommandCenterProvider>
  )
}
