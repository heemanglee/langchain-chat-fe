import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from './CodeBlock'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
}

const components: Components = {
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
    return <ul className="mb-3 list-disc space-y-1 pl-6 last:mb-0">{children}</ul>
  },
  ol({ children }) {
    return <ol className="mb-3 list-decimal space-y-1 pl-6 last:mb-0">{children}</ol>
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

function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-sm max-w-none text-zinc-950 dark:text-zinc-50">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

export { MarkdownRenderer }
