import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadDocument } from '@/api/library'
import { useLibraryStore } from '@/stores/libraryStore'

function useUploadDocument() {
  const queryClient = useQueryClient()
  const { addUpload, updateUpload } = useLibraryStore.getState()

  return useMutation({
    mutationFn: async (file: File) => {
      const fileId = crypto.randomUUID()

      addUpload({
        id: fileId,
        filename: file.name,
        progress: 0,
        status: 'uploading',
      })

      try {
        const result = await uploadDocument(file, (progress) => {
          updateUpload(fileId, { progress })
        })

        updateUpload(fileId, { progress: 100, status: 'completed' })

        return result
      } catch (error) {
        updateUpload(fileId, {
          status: 'failed',
          error: error instanceof Error ? error.message : '업로드 실패',
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'documents'] })
      queryClient.invalidateQueries({ queryKey: ['library', 'storage'] })
    },
  })
}

export { useUploadDocument }
