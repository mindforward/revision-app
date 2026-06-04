'use client'

import { useMemo } from 'react'
import katex from 'katex'

// CSS is imported globally in layout

type Props = {
  text: string
  className?: string
  as?: 'p' | 'span' | 'div'
}

/**
 * Renders inline text with $...$ LaTeX math expressions rendered via KaTeX.
 * Example: "What is $\\frac{8}{9}$?" → "What is ⁸⁄₉ ?"
 */
export default function MathText({ text, className, as: Tag = 'p' }: Props) {
  const parts = useMemo(() => parseLatex(text), [text])

  return (
    <Tag className={className}>
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return <span key={i}>{part.content}</span>
        }
        // LaTeX block — render with KaTeX
        return (
          <span
            key={i}
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(part.content, {
                throwOnError: false,
                displayMode: part.display,
              }),
            }}
          />
        )
      })}
    </Tag>
  )
}

type Part =
  | { type: 'text'; content: string }
  | { type: 'math'; content: string; display: boolean }

function parseLatex(text: string): Part[] {
  const parts: Part[] = []
  let remaining = text

  while (remaining.length > 0) {
    // Try display math $$...$$ first
    const displayMatch = remaining.match(/^\$\$([\s\S]+?)\$\$/)
    if (displayMatch) {
      if (parts.length === 0 || parts[parts.length - 1].type !== 'text' || parts[parts.length - 1].content.length > 0) {
        // Push text before match if any
        // Actually the match is at start of remaining, so no preceding text
      }
      parts.push({ type: 'math', content: displayMatch[1], display: true })
      remaining = remaining.slice(displayMatch[0].length)
      continue
    }

    // Try inline math $...$
    const inlineMatch = remaining.match(/^\$(.+?)\$/)
    if (inlineMatch) {
      parts.push({ type: 'math', content: inlineMatch[1], display: false })
      remaining = remaining.slice(inlineMatch[0].length)
      continue
    }

    // Find next $ delimiter
    const nextDollar = remaining.indexOf('$')
    if (nextDollar === -1) {
      // No more math — rest is plain text
      parts.push({ type: 'text', content: remaining })
      break
    }

    // Text up to the next $
    if (nextDollar > 0) {
      parts.push({ type: 'text', content: remaining.slice(0, nextDollar) })
    }
    remaining = remaining.slice(nextDollar)
  }

  return parts
}
