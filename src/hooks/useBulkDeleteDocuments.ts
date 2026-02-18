import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { deleteDocument } from '@/api/library'
import { useLibraryStore } from '@/stores/libraryStore'

interface BulkDeleteState {
  isDeleting: boolean
  completed: number
  total: number
}

function useBulkDeleteDocuments() {
  const queryClient = useQueryClient()
  const clearSelection = useLibraryStore((s) => s.clearSelection)
  const [state, setState] = useState<BulkDeleteState>({
    isDeleting: false,
    completed: 0,
    total: 0,
  })

  async function bulkDelete(ids: number[]) {
    if (ids.length === 0) return

    setState({ isDeleting: true, completed: 0, total: ids.length })

    const results = await Promise.allSettled(
      ids.map(async (id) => {
        const result = await deleteDocument(id)
        setState((prev) => ({ ...prev, completed: prev.completed + 1 }))
        return result
      }),
    )

    const failedCount = results.filter((r) => r.status === 'rejected').length

    clearSelection()
    queryClient.invalidateQueries({ queryKey: ['library', 'documents'] })
    queryClient.invalidateQueries({ queryKey: ['library', 'storage'] })

    setState({ isDeleting: false, completed: 0, total: 0 })

    if (failedCount > 0) {
      alert(`${ids.length}개 중 ${failedCount}개 삭제에 실패했습니다`)
    }
  }

  return { ...state, bulkDelete }
}

export { useBulkDeleteDocuments }
