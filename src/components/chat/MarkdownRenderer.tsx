import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from './CodeBlock'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  onCitationClick?: (citationId: string) => void
}

const RAW_CITATION_MARKER_PATTERN =
  /\\?\[\s*([^[\]:]{1,20})\s*[:：]\s*(\d+)\s*\\?\]/gi

function isCitationLabel(label: string): boolean {
  const normalized = label.trim().toLowerCase().replace(/\s+/g, '')
  if (!normalized) return false

  const known = new Set([
    'cite',
    'citation',
    'source',
    'src',
    '출처',
    '인용',
    '시민투입',
  ])
  if (known.has(normalized)) return true
  if (normalized.includes('cite')) return true
  if (normalized.includes('source')) return true
  return false
}

function resolveCitationIdFromHref(href?: string): string | null {
  if (!href) return null

  const libMatch = href.match(/^#citation-lib-(\d+)$/i)
  if (libMatch) {
    return `lib-${libMatch[1]}`
  }

  const directLibMatch = href.match(/^#citation-(lib-\d+)$/i)
  if (directLibMatch) {
    return directLibMatch[1].toLowerCase()
  }

  const numberOnlyMatch = href.match(/^#citation-(\d+)$/i)
  if (numberOnlyMatch) {
    return `lib-${numberOnlyMatch[1]}`
  }

  return null
}

function getCitationIndex(citationId: string): string | null {
  const matched = citationId.match(/(\d+)$/)
  return matched ? matched[1] : null
}

function createComponents(
  onCitationClick?: (citationId: string) => void,
): Components {
  return {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className ?? '')
      const codeString = String(children).replace(/\n$/, '')

      if (match) {
        return <CodeBlock language={match[1]}>{codeString}</CodeBlock>
      }

      return (
        <code
          className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          {...props}
        >
          {children}
        </code>
      )
    },
    p({ children }) {
      return <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
    },
    ul({ children }) {
      return (
        <ul className="mb-3 list-disc space-y-1 pl-6 last:mb-0">{children}</ul>
      )
    },
    ol({ children }) {
      return (
        <ol className="mb-3 list-decimal space-y-1 pl-6 last:mb-0">{children}</ol>
      )
    },
    li({ children }) {
      return <li className="leading-relaxed">{children}</li>
    },
    h1({ children }) {
      return <h1 className="mb-3 text-xl font-semibold">{children}</h1>
    },
    h2({ children }) {
      return <h2 className="mb-3 text-lg font-semibold">{children}</h2>
    },
    h3({ children }) {
      return <h3 className="mb-2 text-base font-semibold">{children}</h3>
    },
    blockquote({ children }) {
      return (
        <blockquote className="mb-3 border-l-4 border-zinc-300 pl-4 italic text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
          {children}
        </blockquote>
      )
    },
    a({ href, children }) {
      const citationId = resolveCitationIdFromHref(href)
      if (citationId) {
        const citationIndex = getCitationIndex(citationId)
        const label = citationIndex ? `출처 ${citationIndex}` : '출처'

        return (
          <button
            type="button"
            onClick={() => onCitationClick?.(citationId)}
            className="mx-0.5 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
            aria-label={label}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
            <span>{label}</span>
            <span className="sr-only">{children}</span>
          </button>
        )
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {children}
        </a>
      )
    },
    table({ children }) {
      return (
        <div className="mb-3 overflow-x-auto">
          <table className="min-w-full border-collapse border border-zinc-200 text-sm dark:border-zinc-700">
            {children}
          </table>
        </div>
      )
    },
    th({ children }) {
      return (
        <th className="border border-zinc-200 bg-zinc-100 px-3 py-2 text-left font-medium dark:border-zinc-700 dark:bg-zinc-800">
          {children}
        </th>
      )
    },
    td({ children }) {
      return (
        <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-700">
          {children}
        </td>
      )
    },
  }
}

function MarkdownRenderer({ content, onCitationClick }: MarkdownRendererProps) {
  const processedContent = content.replace(
    RAW_CITATION_MARKER_PATTERN,
    (match, label: string, num: string) => {
      if (!isCitationLabel(label)) return match
      return `[cite:${num}](#citation-lib-${num})`
    },
  )

  return (
    <div className="prose-sm max-w-none text-zinc-950 dark:text-zinc-50">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={createComponents(onCitationClick)}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}

export { MarkdownRenderer }
