import { useRef } from 'react'
import { Icon } from '@iconify/react'
import { useMultiFileUpload } from '@/hooks/useMultiFileUpload'
import { useStorageUsage } from '@/hooks/useLibraryDocuments'
import { LIBRARY_FILE_EXTENSIONS } from '@/lib/constants'

function DocumentUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: storage } = useStorageUsage()

  const remainingBytes = storage
    ? storage.max_bytes - storage.used_bytes
    : Infinity

  const { uploadFiles, isUploading } = useMultiFileUpload({ remainingBytes })

  function handleClick() {
    inputRef.current?.click()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    uploadFiles(Array.from(fileList))
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={LIBRARY_FILE_EXTENSIONS.join(',')}
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <Icon icon="solar:upload-linear" width={16} />
        업로드
      </button>
    </>
  )
}

export { DocumentUploadButton }
