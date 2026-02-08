import { useState, useCallback } from 'react'
import { Icon } from '@iconify/react'

interface CodeBlockProps {
  language?: string
  children: string
}

function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [children])

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between bg-zinc-100 px-4 py-2 dark:bg-zinc-900">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {language ?? 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label={copied ? '복사됨' : '코드 복사'}
        >
          <Icon
            icon={copied ? 'solar:check-circle-bold' : 'solar:copy-linear'}
            width={14}
          />
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
      <pre className="overflow-x-auto bg-zinc-50 p-4 dark:bg-zinc-950">
        <code className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {children}
        </code>
      </pre>
    </div>
  )
}

export { CodeBlock }
