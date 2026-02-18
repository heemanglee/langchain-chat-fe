import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import {
  getIndexStatusLabel,
  isIndexing,
  normalizeIndexStatus,
} from '@/lib/libraryIndexStatus'
import type { LibraryIndexStatus } from '@/types/library'

interface IndexStatusBadgeProps {
  status: LibraryIndexStatus | null | undefined
}

function IndexStatusBadge({ status }: IndexStatusBadgeProps) {
  const normalized = normalizeIndexStatus(status)

  return (
    <span
      className={cn(
        'inline-flex flex-shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium',
        normalized === 'ready' &&
          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        normalized === 'pending' &&
          'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
        normalized === 'processing' &&
          'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        normalized === 'skipped' &&
          'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
        normalized === 'failed' &&
          'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
      )}
    >
      {isIndexing(normalized) && (
        <Icon
          icon="solar:refresh-circle-linear"
          width={10}
          className="animate-spin"
        />
      )}
      <span>{getIndexStatusLabel(normalized)}</span>
    </span>
  )
}

export { IndexStatusBadge }
