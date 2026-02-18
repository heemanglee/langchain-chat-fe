import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { uploadDocument } from '@/api/library'
import { uploadFileSchema } from '@/schemas/library'
import { useLibraryStore } from '@/stores/libraryStore'
import { formatFileSize } from '@/lib/format'

interface UseMultiFileUploadOptions {
  remainingBytes: number
}

function useMultiFileUpload({ remainingBytes }: UseMultiFileUploadOptions) {
  const queryClient = useQueryClient()
  const { addUpload, updateUpload } = useLibraryStore.getState()
  const [isUploading, setIsUploading] = useState(false)

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return

    const validFiles: File[] = []
    for (const file of files) {
      const result = uploadFileSchema.safeParse(file)
      if (!result.success) {
        const fileId = crypto.randomUUID()
        const message = result.error.issues[0]?.message ?? '파일 검증 실패'
        addUpload({
          id: fileId,
          filename: file.name,
          progress: 0,
          status: 'failed',
          error: message,
        })
      } else {
        validFiles.push(file)
      }
    }

    if (validFiles.length === 0) return

    const totalSize = validFiles.reduce((sum, f) => sum + f.size, 0)
    if (totalSize > remainingBytes) {
      const exceeded = totalSize - remainingBytes
      alert(
        `저장 용량이 부족합니다.\n` +
          `필요한 용량: ${formatFileSize(totalSize)}\n` +
          `남은 용량: ${formatFileSize(remainingBytes)}\n` +
          `초과량: ${formatFileSize(exceeded)}`,
      )
      return
    }

    setIsUploading(true)

    for (const file of validFiles) {
      const fileId = crypto.randomUUID()

      addUpload({
        id: fileId,
        filename: file.name,
        progress: 0,
        status: 'uploading',
      })

      try {
        await uploadDocument(file, (progress) => {
          updateUpload(fileId, { progress })
        })
        updateUpload(fileId, { progress: 100, status: 'completed' })
      } catch (error) {
        updateUpload(fileId, {
          status: 'failed',
          error: error instanceof Error ? error.message : '업로드 실패',
        })
      }
    }

    queryClient.invalidateQueries({ queryKey: ['library', 'documents'] })
    queryClient.invalidateQueries({ queryKey: ['library', 'storage'] })
    setIsUploading(false)
  }

  return { uploadFiles, isUploading }
}

export { useMultiFileUpload }
