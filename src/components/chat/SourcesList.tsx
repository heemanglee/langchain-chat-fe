import { Icon } from '@iconify/react'

interface SourcesListProps {
  sources: string[]
}

function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) return null

  return (
    <div className="mt-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <Icon icon="solar:library-linear" width={14} />
        <span>출처 ({sources.length})</span>
      </div>
      <ul className="space-y-1">
        {sources.map((source) => (
          <li
            key={source}
            className="truncate text-xs text-zinc-600 dark:text-zinc-400"
            title={source}
          >
            {source}
          </li>
        ))}
      </ul>
    </div>
  )
}

export { SourcesList }
