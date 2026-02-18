import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { useLibraryDocuments } from '@/hooks/useLibraryDocuments'
import { useLibraryStore } from '@/stores/libraryStore'
import { DocumentItem } from './DocumentItem'
import { DocumentPreviewModal } from './DocumentPreviewModal'
import { BulkActionBar } from './BulkActionBar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'

function DocumentList() {
  const [page, setPage] = useState(1)
  const [preview, setPreview] = useState<{
    id: number
    contentType: string
  } | null>(null)

  const { data, isLoading, isError } = useLibraryDocuments(page)
  const selectedIds = useLibraryStore((s) => s.selectedIds)
  const toggleSelection = useLibraryStore((s) => s.toggleSelection)
  const selectAll = useLibraryStore((s) => s.selectAll)
  const clearSelection = useLibraryStore((s) => s.clearSelection)

  useEffect(() => {
    clearSelection()
  }, [page, clearSelection])

  function handlePreview(id: number, contentType: string) {
    setPreview({ id, contentType })
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Alert variant="error">문서 목록을 불러오는데 실패했습니다</Alert>
      </div>
    )
  }

  if (!data || data.documents.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500">
        <Icon icon="solar:document-linear" width={40} />
        <p className="text-sm">아직 문서가 없습니다</p>
        <p className="text-xs">파일을 업로드하여 라이브러리를 시작하세요</p>
      </div>
    )
  }

  const documentIds = data.documents.map((d) => d.id)
  const allSelected =
    documentIds.length > 0 && documentIds.every((id) => selectedIds.has(id))

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-2 flex items-center gap-2 px-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => selectAll(documentIds)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              전체 선택
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          {data.documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              document={doc}
              onPreview={handlePreview}
              isSelected={selectedIds.has(doc.id)}
              onToggleSelect={toggleSelection}
            />
          ))}
        </div>

        {data.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              이전
            </button>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {page} / {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              다음
            </button>
          </div>
        )}
      </div>

      <BulkActionBar />

      {preview && (
        <DocumentPreviewModal
          documentId={preview.id}
          contentType={preview.contentType}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  )
}

export { DocumentList }
