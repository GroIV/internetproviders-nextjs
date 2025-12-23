'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface MainContentProps {
  children: ReactNode
}

export function MainContent({ children }: MainContentProps) {
  const pathname = usePathname()

  // Homepage has embedded chat, so no sidebar margin needed
  // AI assistant page also doesn't need sidebar
  const needsSidebarMargin = pathname !== '/' && pathname !== '/tools/ai-assistant'

  return (
    <div className={`flex-1 flex flex-col min-w-0 ${needsSidebarMargin ? 'lg:mr-[380px]' : ''}`}>
      {children}
    </div>
  )
}
