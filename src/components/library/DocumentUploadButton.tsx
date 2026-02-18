import { useRef } from 'react'
import { Icon } from '@iconify/react'
import { useUploadDocument } from '@/hooks/useUploadDocument'
import { uploadFileSchema } from '@/schemas/library'
import { LIBRARY_FILE_EXTENSIONS } from '@/lib/constants'

function DocumentUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate, isPending } = useUploadDocument()

  function handleClick() {
    inputRef.current?.click()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const result = uploadFileSchema.safeParse(file)
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? '파일 검증 실패'
      alert(message)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    mutate(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={LIBRARY_FILE_EXTENSIONS.join(',')}
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <Icon icon="solar:upload-linear" width={16} />
        업로드
      </button>
    </>
  )
}

export { DocumentUploadButton }
