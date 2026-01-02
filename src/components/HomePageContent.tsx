'use client'

import { useEffect } from 'react'
import { useCommandCenter } from '@/contexts/CommandCenterContext'
import { WelcomePanel } from './command-center/panels'

export function HomePageContent() {
  const { showPanel, activePanel } = useCommandCenter()

  // Show welcome panel when on homepage
  useEffect(() => {
    // Only set to welcome if currently showing page content
    if (activePanel.type === 'pageContent') {
      showPanel('welcome')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount to show welcome panel
  }, [])

  // The WelcomePanel is shown via the panel system,
  // but we also render it here as fallback content
  return <WelcomePanel />
}
