import { cn } from '@/lib/utils'
import type { LibraryDocument } from '@/types/library'

type SummaryStatus = LibraryDocument['summary_status']

interface SummaryStatusBadgeProps {
  summaryStatus: SummaryStatus
}

const STATUS_CONFIG: Record<
  SummaryStatus,
  { label: string; className: string; showSpinner: boolean }
> = {
  pending: {
    label: '요약 중',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    showSpinner: true,
  },
  processing: {
    label: '요약 중',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    showSpinner: true,
  },
  completed: {
    label: '사용 가능',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    showSpinner: false,
  },
  failed: {
    label: '사용 불가',
    className:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    showSpinner: false,
  },
}

function SummaryStatusBadge({ summaryStatus }: SummaryStatusBadgeProps) {
  const config = STATUS_CONFIG[summaryStatus]

  return (
    <span
      className={cn(
        'inline-flex flex-shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium',
        config.className,
      )}
    >
      {config.showSpinner && (
        <svg
          className="h-3 w-3 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {config.label}
    </span>
  )
}

export { SummaryStatusBadge }
