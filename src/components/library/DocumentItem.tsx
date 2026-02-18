import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { formatRelativeTime, formatFileSize } from '@/lib/format'
import {
  useUpdateDocumentStatus,
  useDeleteDocument,
  useReindexDocument,
} from '@/hooks/useLibraryMutations'
import { SummaryStatusBadge } from './SummaryStatusBadge'
import { IndexStatusBadge } from './IndexStatusBadge'
import { API_BASE_URL } from '@/lib/constants'
import { normalizeIndexStatus } from '@/lib/libraryIndexStatus'
import type { LibraryDocument } from '@/types/library'

interface DocumentItemProps {
  document: LibraryDocument
  onPreview: (id: number, contentType: string) => void
  isSelected?: boolean
  onToggleSelect?: (id: number) => void
}

function getFileIcon(contentType: string): string {
  if (contentType.startsWith('image/')) return 'solar:image-linear'
  if (contentType.startsWith('text/')) return 'solar:file-text-linear'
  return 'solar:document-linear'
}

function DocumentItem({
  document: doc,
  onPreview,
  isSelected = false,
  onToggleSelect,
}: DocumentItemProps) {
  const updateStatus = useUpdateDocumentStatus()
  const deleteDoc = useDeleteDocument()
  const reindexDoc = useReindexDocument()

  const isArchived = doc.status === 'archived'
  const normalizedIndexStatus = normalizeIndexStatus(doc.index_status)

  function handleDownload() {
    window.open(
      `${API_BASE_URL}/api/v1/library/documents/${doc.id}/download`,
      '_blank',
    )
  }

  function handleToggleStatus() {
    const newStatus = isArchived ? 'active' : 'archived'
    updateStatus.mutate({ id: doc.id, data: { status: newStatus } })
  }

  function handleDelete() {
    if (!window.confirm(`"${doc.original_filename}" 파일을 삭제하시겠습니까?`)) return
    deleteDoc.mutate(doc.id)
  }

  function handleReindex() {
    reindexDoc.mutate(doc.id)
  }

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50',
        isArchived && 'opacity-50',
      )}
    >
      {onToggleSelect && (
        <label className="mt-0.5 flex flex-shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(doc.id)}
            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700"
          />
        </label>
      )}

      <div className="mt-0.5 flex-shrink-0 text-zinc-400 dark:text-zinc-500">
        <Icon icon={getFileIcon(doc.content_type)} width={20} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {doc.original_filename}
          </span>
          {isArchived && (
            <span className="flex-shrink-0 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
              보관됨
            </span>
          )}
          <SummaryStatusBadge summaryStatus={doc.summary_status} />
          <IndexStatusBadge status={doc.index_status} />
          {normalizedIndexStatus === 'failed' && (
            <button
              type="button"
              onClick={handleReindex}
              disabled={reindexDoc.isPending}
              className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
            >
              {reindexDoc.isPending ? '재시도 중...' : '재인덱싱'}
            </button>
          )}
        </div>

        {doc.summary && (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
            {doc.summary}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
          <span>{formatFileSize(doc.file_size)}</span>
          <span>·</span>
          <span>{formatRelativeTime(doc.created_at)}</span>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onPreview(doc.id, doc.content_type)}
          title="미리보기"
          className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
        >
          <Icon icon="solar:eye-linear" width={16} />
        </button>
        <button
          onClick={handleDownload}
          title="다운로드"
          className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
        >
          <Icon icon="solar:download-linear" width={16} />
        </button>
        <button
          onClick={handleToggleStatus}
          title={isArchived ? '활성화' : '보관'}
          className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
        >
          <Icon
            icon={isArchived ? 'solar:restart-linear' : 'solar:archive-linear'}
            width={16}
          />
        </button>
        <button
          onClick={handleDelete}
          title="삭제"
          className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-700 dark:hover:text-red-400"
        >
          <Icon icon="solar:trash-bin-2-linear" width={16} />
        </button>
      </div>
    </div>
  )
}

export { DocumentItem }
