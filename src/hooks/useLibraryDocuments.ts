import { useQuery } from '@tanstack/react-query'
import { fetchDocuments, fetchStorageUsage } from '@/api/library'
import { useLibraryStore } from '@/stores/libraryStore'
import { LIBRARY_PAGE_SIZE } from '@/lib/constants'

function useLibraryDocuments(page: number = 1) {
  const includeArchived = useLibraryStore((s) => s.includeArchived)

  return useQuery({
    queryKey: ['library', 'documents', { page, includeArchived }],
    queryFn: () =>
      fetchDocuments({
        page,
        size: LIBRARY_PAGE_SIZE,
        include_archived: includeArchived,
      }),
    select: (data) => {
      const listData = data.data
      if (!listData) return { documents: [], total: 0, totalPages: 0, page: 1 }
      return {
        documents: listData.documents,
        total: listData.total,
        totalPages: Math.ceil(listData.total / listData.size),
        page: listData.page,
      }
    },
  })
}

function useStorageUsage() {
  return useQuery({
    queryKey: ['library', 'storage'],
    queryFn: fetchStorageUsage,
    staleTime: 30 * 1000,
    select: (data) => data.data,
  })
}

export { useLibraryDocuments, useStorageUsage }
