import { Icon } from '@iconify/react'
import { useLibraryStore } from '@/stores/libraryStore'
import { useBulkDeleteDocuments } from '@/hooks/useBulkDeleteDocuments'

function BulkActionBar() {
  const selectedIds = useLibraryStore((s) => s.selectedIds)
  const clearSelection = useLibraryStore((s) => s.clearSelection)
  const { isDeleting, completed, total, bulkDelete } = useBulkDeleteDocuments()

  const count = selectedIds.size

  if (count === 0) return null

  function handleDelete() {
    const confirmed = window.confirm(
      `선택한 ${count}개의 문서를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
    )
    if (!confirmed) return
    bulkDelete(Array.from(selectedIds))
  }

  return (
    <div className="sticky bottom-0 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {isDeleting
            ? `삭제 중... (${completed}/${total})`
            : `${count}개 선택됨`}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={clearSelection}
            disabled={isDeleting}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            선택 해제
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            <Icon icon="solar:trash-bin-2-linear" width={14} />
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}

export { BulkActionBar }
