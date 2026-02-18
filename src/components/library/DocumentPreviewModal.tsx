import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { fetchDocumentDetail } from '@/api/library'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface DocumentPreviewModalProps {
  documentId: number
  contentType: string
  onClose: () => void
}

function DocumentPreviewModal({
  documentId,
  contentType,
  onClose,
}: DocumentPreviewModalProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['library', 'documents', documentId, 'detail'],
    queryFn: () => fetchDocumentDetail(documentId),
    select: (res) => res.data,
  })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const previewUrl = data?.preview_url

  function renderPreview() {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (error || !previewUrl) {
      return (
        <div className="flex h-full items-center justify-center text-zinc-400">
          미리보기를 불러올 수 없습니다
        </div>
      )
    }

    if (contentType === 'application/pdf') {
      return (
        <iframe
          src={previewUrl}
          title="Document preview"
          className="h-full w-full"
        />
      )
    }

    if (contentType.startsWith('image/')) {
      return (
        <div className="flex h-full items-center justify-center p-4">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )
    }

    if (contentType.startsWith('text/')) {
      return (
        <iframe
          src={previewUrl}
          title="Text preview"
          className="h-full w-full bg-white"
        />
      )
    }

    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        이 파일 형식은 미리보기를 지원하지 않습니다
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative h-[85vh] w-[85vw] max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <h3 className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {data?.original_filename ?? '미리보기'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <Icon icon="solar:close-circle-linear" width={20} />
          </button>
        </div>

        <div className="h-[calc(85vh-48px)]">{renderPreview()}</div>
      </div>
    </div>
  )
}

export { DocumentPreviewModal }
