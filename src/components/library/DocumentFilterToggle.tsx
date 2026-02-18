import { useLibraryStore } from '@/stores/libraryStore'
import { cn } from '@/lib/utils'

function DocumentFilterToggle() {
  const { includeArchived, setIncludeArchived } = useLibraryStore()

  return (
    <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
      <button
        onClick={() => setIncludeArchived(false)}
        className={cn(
          'rounded-l-lg px-3 py-1.5 text-xs font-medium transition-colors',
          !includeArchived
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
        )}
      >
        활성
      </button>
      <button
        onClick={() => setIncludeArchived(true)}
        className={cn(
          'rounded-r-lg px-3 py-1.5 text-xs font-medium transition-colors',
          includeArchived
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
        )}
      >
        전체
      </button>
    </div>
  )
}

export { DocumentFilterToggle }
