import { DocumentFilterToggle } from './DocumentFilterToggle'
import { DocumentUploadButton } from './DocumentUploadButton'
import { useStorageUsage } from '@/hooks/useLibraryDocuments'
import { formatFileSize } from '@/lib/format'
import { cn } from '@/lib/utils'

function LibraryHeader() {
  const { data: storage } = useStorageUsage()

  const usagePercent = storage
    ? Math.round((storage.used_bytes / storage.max_bytes) * 100)
    : 0

  return (
    <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          라이브러리
        </h1>
        <div className="flex items-center gap-2">
          <DocumentFilterToggle />
          <DocumentUploadButton />
        </div>
      </div>

      {storage && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>
              {formatFileSize(storage.used_bytes)} / {formatFileSize(storage.max_bytes)} 사용 중
            </span>
            <span>{storage.document_count}개 문서</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                usagePercent >= 90
                  ? 'bg-red-500'
                  : usagePercent >= 70
                    ? 'bg-amber-500'
                    : 'bg-blue-500',
              )}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export { LibraryHeader }
