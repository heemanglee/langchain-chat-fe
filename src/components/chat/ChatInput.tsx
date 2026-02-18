import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type FormEvent,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { Icon } from '@iconify/react'
import { useAutoResize } from '@/hooks/useAutoResize'
import { MAX_MESSAGE_LENGTH, MAX_IMAGE_COUNT, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants'
import { ImagePreviewList } from './ImagePreviewList'
import { IndexStatusBadge } from '@/components/library/IndexStatusBadge'
import {
  isReadyForSelection,
  normalizeIndexStatus,
} from '@/lib/libraryIndexStatus'
import type { SendMessageOptions } from '@/types/chat'
import type { LibraryDocument } from '@/types/library'

interface ChatInputProps {
  onSend: (content: string, options?: SendMessageOptions) => void
  isStreaming: boolean
  onStop: () => void
  documents?: LibraryDocument[]
  isDocumentsLoading?: boolean
  selectedDocumentIds?: number[]
  onSelectedDocumentIdsChange?: (ids: number[]) => void
  onReindexDocument?: (id: number) => void
}

function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return `${file.name}: 지원하지 않는 이미지 형식입니다.`
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `${file.name}: 파일 크기가 10MB를 초과합니다.`
  }
  return null
}

function ChatInput({
  onSend,
  isStreaming,
  onStop,
  documents = [],
  isDocumentsLoading = false,
  selectedDocumentIds = [],
  onSelectedDocumentIdsChange,
  onReindexDocument,
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const [useWebSearch, setUseWebSearch] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false)
  const dragCounterRef = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const documentMenuRef = useRef<HTMLDivElement>(null)
  const { textareaRef, resize, reset } = useAutoResize()

  const canSend = (input.trim().length > 0 || images.length > 0) && !isStreaming
  const selectedDocumentSet = useMemo(
    () => new Set(selectedDocumentIds),
    [selectedDocumentIds],
  )

  const selectedDocuments = useMemo(
    () => documents.filter((doc) => selectedDocumentSet.has(doc.id)),
    [documents, selectedDocumentSet],
  )

  useEffect(() => {
    if (isDocumentsLoading) return
    if (!onSelectedDocumentIdsChange || selectedDocumentIds.length === 0) return

    const readyIds = new Set(
      documents
        .filter((doc) => isReadyForSelection(doc.index_status))
        .map((doc) => doc.id),
    )

    const filtered = selectedDocumentIds.filter((id) => readyIds.has(id))
    if (filtered.length !== selectedDocumentIds.length) {
      onSelectedDocumentIdsChange(filtered)
    }
  }, [
    documents,
    isDocumentsLoading,
    onSelectedDocumentIdsChange,
    selectedDocumentIds,
  ])

  useEffect(() => {
    if (!isDocumentSelectorOpen) return

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node | null
      if (documentMenuRef.current && !documentMenuRef.current.contains(target)) {
        setIsDocumentSelectorOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isDocumentSelectorOpen])

  const toggleDocumentSelection = useCallback(
    (documentId: number) => {
      if (!onSelectedDocumentIdsChange) return

      const next = selectedDocumentSet.has(documentId)
        ? selectedDocumentIds.filter((id) => id !== documentId)
        : [...selectedDocumentIds, documentId]

      onSelectedDocumentIdsChange(next)
    },
    [onSelectedDocumentIdsChange, selectedDocumentIds, selectedDocumentSet],
  )

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault()
      if (!canSend) return

      const sendOptions: SendMessageOptions = {
        useWebSearch,
      }
      if (selectedDocumentIds.length > 0) {
        sendOptions.selectedDocumentIds = selectedDocumentIds
      }
      if (images.length > 0) {
        sendOptions.images = images
      }

      onSend(input.trim(), sendOptions)
      setInput('')
      setImages([])
      setIsDocumentSelectorOpen(false)
      reset()
    },
    [canSend, input, useWebSearch, selectedDocumentIds, images, onSend, reset],
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

  const addImageFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return

      const remaining = MAX_IMAGE_COUNT - images.length
      if (remaining <= 0) {
        alert(`이미지는 최대 ${MAX_IMAGE_COUNT}장까지 첨부할 수 있습니다.`)
        return
      }

      const toAdd = files.slice(0, remaining)
      const messages: string[] = []
      const valid: File[] = []

      for (const file of toAdd) {
        const error = validateImageFile(file)
        if (error) {
          messages.push(error)
        } else {
          valid.push(file)
        }
      }

      if (files.length > remaining) {
        messages.push(`이미지는 최대 ${MAX_IMAGE_COUNT}장까지 첨부할 수 있습니다. ${remaining}장만 추가되었습니다.`)
      }

      if (messages.length > 0) {
        alert(messages.join('\n'))
      }

      if (valid.length > 0) {
        setImages((prev) => [...prev, ...valid])
      }
    },
    [images.length],
  )

  const handleImageSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      addImageFiles(files)
      e.target.value = ''
    },
    [addImageFiles],
  )

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current += 1
      if (dragCounterRef.current === 1 && !isStreaming) {
        setIsDragging(true)
      }
    },
    [isStreaming],
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      setIsDragging(false)

      if (isStreaming) return

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(f.type),
      )
      addImageFiles(files)
    },
    [isStreaming, addImageFiles],
  )

  const handleImageRemove = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  return (
    <div
      data-testid="chat-input-container"
      className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="relative">
          <div
            className={`rounded-xl border bg-white transition-colors focus-within:border-zinc-400 dark:bg-zinc-800 dark:focus-within:border-zinc-500 ${
              isDragging
                ? 'border-blue-400 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30'
                : 'border-zinc-200 dark:border-zinc-700'
            }`}
          >
            {isDragging && (
              <div
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400"
                role="status"
                aria-live="polite"
              >
                <Icon icon="solar:upload-minimalistic-linear" width={20} />
                <span>이미지를 여기에 놓으세요</span>
              </div>
            )}
            {images.length > 0 && (
              <div className="border-b border-zinc-100 pt-2 dark:border-zinc-700">
                <ImagePreviewList images={images} onRemove={handleImageRemove} />
              </div>
            )}

            <div className="flex items-end gap-2 p-2">
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

              <div className="relative" ref={documentMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsDocumentSelectorOpen((prev) => !prev)}
                  disabled={isStreaming}
                  className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors disabled:opacity-40 ${
                    selectedDocumentIds.length > 0
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'
                  }`}
                  aria-label="참조 문서 선택"
                  aria-expanded={isDocumentSelectorOpen}
                >
                  <Icon icon="solar:documents-linear" width={16} />
                  <span className="hidden sm:inline">
                    문서
                    {selectedDocumentIds.length > 0
                      ? ` (${selectedDocumentIds.length})`
                      : ''}
                  </span>
                </button>

                {isDocumentSelectorOpen && (
                  <div className="absolute bottom-11 left-0 z-20 w-[320px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-700">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                        참조 문서 선택
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        검색 가능한 문서만 선택할 수 있습니다
                      </p>
                    </div>

                    <div className="max-h-72 overflow-y-auto p-2">
                      {isDocumentsLoading ? (
                        <p className="px-2 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                          문서를 불러오는 중...
                        </p>
                      ) : documents.length === 0 ? (
                        <p className="px-2 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                          업로드된 문서가 없습니다
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {documents.map((doc) => {
                            const ready = isReadyForSelection(doc.index_status)
                            const failed =
                              normalizeIndexStatus(doc.index_status) === 'failed'

                            return (
                              <li
                                key={doc.id}
                                className="rounded-lg border border-zinc-100 px-2 py-2 dark:border-zinc-800"
                              >
                                <div className="flex items-start gap-2">
                                  <button
                                    type="button"
                                    disabled={!ready}
                                    onClick={() => toggleDocumentSelection(doc.id)}
                                    className="flex min-w-0 flex-1 items-start gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedDocumentSet.has(doc.id)}
                                      readOnly
                                      disabled={!ready}
                                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700"
                                    />
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">
                                        {doc.original_filename}
                                      </p>
                                      <div className="mt-1">
                                        <IndexStatusBadge status={doc.index_status} />
                                      </div>
                                    </div>
                                  </button>

                                  {failed && onReindexDocument && (
                                    <button
                                      type="button"
                                      onClick={() => onReindexDocument(doc.id)}
                                      className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                                    >
                                      재인덱싱
                                    </button>
                                  )}
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-40 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                aria-label="이미지 첨부"
              >
                <Icon icon="solar:paperclip-linear" width={16} />
                {images.length > 0 && (
                  <span className="text-zinc-600 dark:text-zinc-300">
                    {images.length}/{MAX_IMAGE_COUNT}
                  </span>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={handleImageSelect}
                className="hidden"
                aria-hidden="true"
              />

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

            {selectedDocuments.length > 0 && (
              <div className="flex flex-wrap gap-1 border-t border-zinc-100 px-2 pb-2 pt-1 dark:border-zinc-700">
                {selectedDocuments.map((doc) => (
                  <span
                    key={doc.id}
                    className="inline-flex max-w-full items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    title={doc.original_filename}
                  >
                    <Icon icon="solar:documents-linear" width={12} />
                    <span className="truncate">{doc.original_filename}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export { ChatInput }
