'use client'

import { useState, useEffect, useCallback } from 'react'
import { MarkdownContent } from './MarkdownContent'

interface TypewriterTextProps {
  content: string
  speed?: number // ms per character
  onComplete?: () => void
  className?: string
}

// Strip markdown link syntax for plain text display during animation
function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}

export function TypewriterText({
  content,
  speed = 12,
  onComplete,
  className = ''
}: TypewriterTextProps) {
  const [displayedIndex, setDisplayedIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isSkipped, setIsSkipped] = useState(false)

  // Plain text version for typewriter animation
  const plainContent = stripMarkdownLinks(content)

  const skipAnimation = useCallback(() => {
    setDisplayedIndex(plainContent.length)
    setIsComplete(true)
    setIsSkipped(true)
    onComplete?.()
  }, [plainContent.length, onComplete])

  useEffect(() => {
    // Reset when content changes
    setDisplayedIndex(0)
    setIsComplete(false)
    setIsSkipped(false)

    let index = 0
    let animationFrame: number

    const typeNextChar = () => {
      if (index < plainContent.length) {
        setDisplayedIndex(index + 1)
        index++
        animationFrame = window.setTimeout(typeNextChar, speed)
      } else {
        setIsComplete(true)
        onComplete?.()
      }
    }

    // Start typing after a brief delay
    animationFrame = window.setTimeout(typeNextChar, 100)

    return () => {
      if (animationFrame) clearTimeout(animationFrame)
    }
  }, [plainContent, speed, onComplete])

  // Once complete, render with markdown links
  if (isComplete) {
    return <MarkdownContent content={content} className={className} />
  }

  // During animation, show plain text
  return (
    <span className={className}>
      {plainContent.slice(0, displayedIndex)}
      <span className="typewriter-cursor" />
      {!isSkipped && displayedIndex > 20 && (
        <button
          onClick={skipAnimation}
          className="ml-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Skip animation"
        >
          Skip
        </button>
      )}
    </span>
  )
}
