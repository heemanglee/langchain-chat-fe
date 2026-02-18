import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import type { Citation, LibraryCitation } from '@/types/chat'

interface SourcesListProps {
  sources: Citation[]
  activeCitationId?: string | null
  onOpenLibraryCitation?: (
    citation: LibraryCitation,
    anchorId?: string,
  ) => void
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function SourcesList({
  sources,
  activeCitationId = null,
  onOpenLibraryCitation,
}: SourcesListProps) {
  if (sources.length === 0) return null

  const webCount = sources.filter((source) => source.source_type === 'web').length
  const libraryCount = sources.length - webCount

  return (
    <div className="mt-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <Icon icon="solar:library-linear" width={14} />
        <span>출처 ({sources.length})</span>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
          웹 {webCount} · 문서 {libraryCount}
        </span>
      </div>
      <ul className="space-y-1">
        {sources.map((source) => (
          <li key={source.citation_id}>
            {source.source_type === 'web' ? (
              <button
                type="button"
                disabled={!isValidUrl(source.url)}
                onClick={() =>
                  window.open(source.url, '_blank', 'noopener,noreferrer')
                }
                className={cn(
                  'flex w-full items-start gap-1.5 rounded-md px-2 py-1 text-left text-xs transition-colors',
                  'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  activeCitationId === source.citation_id &&
                    'bg-zinc-100 dark:bg-zinc-800',
                )}
              >
                <Icon icon="solar:global-linear" width={14} className="mt-0.5" />
                <span className="min-w-0 truncate">
                  {source.title || source.url}
                </span>
                <Icon
                  icon="solar:arrow-right-up-linear"
                  width={12}
                  className="ml-auto mt-0.5 shrink-0"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onOpenLibraryCitation?.(
                    source,
                    source.anchors[0]?.anchor_id,
                  )
                }
                className={cn(
                  'flex w-full items-start gap-1.5 rounded-md px-2 py-1 text-left text-xs transition-colors',
                  'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
                  activeCitationId === source.citation_id &&
                    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
                )}
              >
                <Icon
                  icon="solar:file-text-linear"
                  width={14}
                  className="mt-0.5 shrink-0"
                />
                <span className="min-w-0">
                  <span className="line-clamp-1 font-medium">
                    {source.file_name || source.title}
                  </span>
                  <span className="line-clamp-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    참조 {source.anchors.length}개
                    {source.snippet ? ` · ${source.snippet}` : ''}
                  </span>
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export { SourcesList }
