import { useState, useCallback, type KeyboardEvent, type FormEvent } from 'react'
import { Icon } from '@iconify/react'
import { useAutoResize } from '@/hooks/useAutoResize'
import { MAX_MESSAGE_LENGTH } from '@/lib/constants'

interface ChatInputProps {
  onSend: (content: string, options?: { useWebSearch?: boolean }) => void
  isStreaming: boolean
  onStop: () => void
}

function ChatInput({ onSend, isStreaming, onStop }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [useWebSearch, setUseWebSearch] = useState(false)
  const { textareaRef, resize, reset } = useAutoResize()

  const canSend = input.trim().length > 0 && !isStreaming

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault()
      if (!canSend) return

      onSend(input.trim(), { useWebSearch })
      setInput('')
      reset()
    },
    [canSend, input, useWebSearch, onSend, reset],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  return (
    <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 rounded-xl border border-zinc-200 bg-white p-2 transition-colors focus-within:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:focus-within:border-zinc-500">
            <button
              type="button"
              onClick={() => setUseWebSearch((prev) => !prev)}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${
                useWebSearch
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                  : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'
              }`}
              aria-label={useWebSearch ? '웹 검색 켜짐' : '웹 검색 꺼짐'}
              aria-pressed={useWebSearch}
            >
              <Icon icon="solar:magnifer-linear" width={16} />
              <span className="hidden sm:inline">웹 검색</span>
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                resize()
              }}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              maxLength={MAX_MESSAGE_LENGTH}
              rows={1}
              className="flex-1 resize-none bg-transparent py-2 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              disabled={isStreaming}
            />

            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
                aria-label="응답 중단"
              >
                <Icon icon="solar:stop-bold" width={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 transition-colors hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:hover:bg-zinc-50"
                aria-label="메시지 전송"
              >
                <Icon icon="solar:arrow-up-linear" width={18} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export { ChatInput }
