'use client'

import { useMemo } from 'react'
import katex from 'katex'

/**
 * Renders inline $...$ and display $$...$$ math expressions within text.
 * Non-math text is returned as-is.
 */
export function renderMath(text: string): (string | { html: string })[] {
  const parts: (string | { html: string })[] = []
  // Match $$...$$ (display) or $...$ (inline)
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    // Plain text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const raw = match[0]
    const isDisplay = raw.startsWith('$$')
    const formula = raw.slice(isDisplay ? 2 : 1, isDisplay ? -2 : -1)

    try {
      const html = katex.renderToString(formula, {
        displayMode: isDisplay,
        throwOnError: false,
      })
      parts.push({ html })
    } catch {
      parts.push(raw) // fallback
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

export default function MathText({ text }: { text: string }) {
  const parts = useMemo(() => renderMath(text), [text])

  return (
    <>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          <span key={i}>{part}</span>
        ) : (
          <span key={i} dangerouslySetInnerHTML={{ __html: part.html }} />
        )
      )}
    </>
  )
}
