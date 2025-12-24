'use client'

import { useState, useEffect, useCallback } from 'react'

interface TypewriterTextProps {
  content: string
  speed?: number // ms per character
  onComplete?: () => void
  className?: string
}

export function TypewriterText({
  content,
  speed = 12,
  onComplete,
  className = ''
}: TypewriterTextProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [isSkipped, setIsSkipped] = useState(false)

  const skipAnimation = useCallback(() => {
    setDisplayedContent(content)
    setIsComplete(true)
    setIsSkipped(true)
    onComplete?.()
  }, [content, onComplete])

  useEffect(() => {
    // Reset when content changes
    setDisplayedContent('')
    setIsComplete(false)
    setIsSkipped(false)

    let index = 0
    let animationFrame: number

    const typeNextChar = () => {
      if (index < content.length) {
        setDisplayedContent(content.slice(0, index + 1))
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
  }, [content, speed, onComplete])

  return (
    <span className={className}>
      {displayedContent}
      {!isComplete && (
        <>
          <span className="typewriter-cursor" />
          {!isSkipped && displayedContent.length > 20 && (
            <button
              onClick={skipAnimation}
              className="ml-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Skip animation"
            >
              Skip
            </button>
          )}
        </>
      )}
    </span>
  )
}
