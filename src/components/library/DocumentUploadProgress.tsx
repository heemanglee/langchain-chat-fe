import { useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useLibraryStore } from '@/stores/libraryStore'
import { cn } from '@/lib/utils'

function DocumentUploadProgress() {
  const uploads = useLibraryStore((s) => s.uploads)
  const removeUpload = useLibraryStore((s) => s.removeUpload)

  useEffect(() => {
    const completedIds = uploads
      .filter((u) => u.status === 'completed')
      .map((u) => u.id)

    if (completedIds.length === 0) return

    const timers = completedIds.map((id) =>
      setTimeout(() => removeUpload(id), 3000),
    )

    return () => timers.forEach(clearTimeout)
  }, [uploads, removeUpload])

  if (uploads.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {uploads.map((upload) => (
        <div
          key={upload.id}
          className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div className="mb-1.5 flex items-center justify-between">
            <span className="max-w-[200px] truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {upload.filename}
            </span>
            <div className="flex items-center gap-1">
              {upload.status === 'uploading' && (
                <span className="text-xs text-zinc-500">{upload.progress}%</span>
              )}
              {upload.status === 'completed' && (
                <Icon
                  icon="solar:check-circle-bold"
                  width={16}
                  className="text-emerald-500"
                />
              )}
              {upload.status === 'failed' && (
                <Icon
                  icon="solar:close-circle-bold"
                  width={16}
                  className="text-red-500"
                />
              )}
            </div>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                upload.status === 'failed'
                  ? 'bg-red-500'
                  : upload.status === 'completed'
                    ? 'bg-emerald-500'
                    : 'bg-blue-500',
              )}
              style={{ width: `${upload.progress}%` }}
            />
          </div>

          {upload.status === 'failed' && upload.error && (
            <p className="mt-1 text-xs text-red-500">{upload.error}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export { DocumentUploadProgress }
