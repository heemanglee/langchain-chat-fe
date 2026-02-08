import { useState, useCallback, useEffect } from 'react'
import { useAutoResize } from '@/hooks/useAutoResize'
import { MAX_MESSAGE_LENGTH } from '@/lib/constants'

interface MessageEditFormProps {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
}

function MessageEditForm({ initialContent, onSave, onCancel }: MessageEditFormProps) {
  const [content, setContent] = useState(initialContent)
  const { textareaRef, resize } = useAutoResize()

  useEffect(() => {
    resize()
  }, [resize])

  const handleSubmit = useCallback(() => {
    const trimmed = content.trim()
    if (!trimmed) return
    onSave(trimmed)
  }, [content, onSave])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
      if (e.key === 'Escape') {
        onCancel()
      }
    },
    [handleSubmit, onCancel],
  )

  return (
    <div className="w-full space-y-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          resize()
        }}
        onKeyDown={handleKeyDown}
        maxLength={MAX_MESSAGE_LENGTH}
        className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-500"
        rows={1}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          저장 & 전송
        </button>
      </div>
    </div>
  )
}

export { MessageEditForm }
