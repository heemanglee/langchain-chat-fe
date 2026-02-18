import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  updateDocumentStatus,
  deleteDocument,
  reindexDocument,
} from '@/api/library'
import type { UpdateStatusRequest } from '@/types/library'

function useUpdateDocumentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStatusRequest }) =>
      updateDocumentStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'documents'] })
    },
  })
}

function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'documents'] })
      queryClient.invalidateQueries({ queryKey: ['library', 'storage'] })
    },
  })
}

function useReindexDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => reindexDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'documents'] })
    },
  })
}

export { useUpdateDocumentStatus, useDeleteDocument, useReindexDocument }
