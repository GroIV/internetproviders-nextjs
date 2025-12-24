'use client'

import Link from 'next/link'
import { Fragment, useMemo } from 'react'

interface MarkdownContentProps {
  content: string
  className?: string
}

// Parse markdown links [text](url) and render as Next.js Links
export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const elements = useMemo(() => {
    // Regex to match markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const parts: (string | { text: string; url: string })[] = []
    let lastIndex = 0
    let match

    while ((match = linkRegex.exec(content)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index))
      }
      // Add the link
      parts.push({ text: match[1], url: match[2] })
      lastIndex = match.index + match[0].length
    }

    // Add remaining text after the last link
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex))
    }

    return parts
  }, [content])

  return (
    <span className={className}>
      {elements.map((part, i) => {
        if (typeof part === 'string') {
          return <Fragment key={i}>{part}</Fragment>
        }
        // Check if it's an internal or external link
        const isInternal = part.url.startsWith('/')
        if (isInternal) {
          return (
            <Link
              key={i}
              href={part.url}
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
              {part.text}
            </Link>
          )
        }
        return (
          <a
            key={i}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
          >
            {part.text}
          </a>
        )
      })}
    </span>
  )
}
