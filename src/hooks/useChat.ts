import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { streamChat, streamEditMessage, streamRegenerate } from '@/api/chat'
import type {
  ImageSummary,
  LibraryCitation,
  Message,
  SendMessageOptions,
  StreamDonePayload,
} from '@/types/chat'

interface ToolCallState {
  name: string
  status: 'calling' | 'done'
}

interface UseChatOptions {
  conversationId?: string
  initialMessages?: Message[]
  isHistoryLoading?: boolean
}

interface UseChatReturn {
  messages: Message[]
  isStreaming: boolean
  isLoading: boolean
  error: Error | null
  toolCall: ToolCallState | null
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<void>
  editMessage: (messageServerId: number, newContent: string) => Promise<void>
  regenerateMessage: (messageServerId: number) => Promise<void>
  stopStreaming: () => void
}

interface ParsedDocumentToolSource {
  sourceIndex: number
  documentId: number
  page: number | null
  quote: string
}

const TOOL_SOURCE_PATTERN =
  /\[Source\s+(\d+):\s*document_id=(\d+)(?:\s*\(page\s*(\d+)\))?\]\s*\n([\s\S]*?)(?=\n\s*\[Source\s+\d+:|\s*$)/gi

function isCitationLabel(label: string): boolean {
  const normalized = label.trim().toLowerCase().replace(/\s+/g, '')
  if (!normalized) return false

  const known = new Set([
    'cite',
    'citation',
    'source',
    'src',
    '출처',
    '인용',
    '시민투입',
  ])
  if (known.has(normalized)) return true
  if (normalized.includes('cite')) return true
  if (normalized.includes('source')) return true
  return false
}

function extractCitedIndices(content: string): Set<number> {
  const result = new Set<number>()
  const markerPattern = /\[\s*([^[\]:]{1,20})\s*[:：]\s*(\d+)\s*\]/gi
  for (const match of content.matchAll(markerPattern)) {
    const label = match[1] ?? ''
    if (!isCitationLabel(label)) continue

    const index = Number(match[2])
    if (!Number.isNaN(index) && index > 0) {
      result.add(index)
    }
  }
  return result
}

function parseDocumentSearchToolOutput(
  output: string,
): ParsedDocumentToolSource[] {
  const parsed: ParsedDocumentToolSource[] = []
  for (const match of output.matchAll(new RegExp(TOOL_SOURCE_PATTERN.source, 'gi'))) {
    const sourceIndex = Number(match[1])
    const documentId = Number(match[2])
    const page = match[3] ? Number(match[3]) : null
    const quote = match[4]?.trim() ?? ''

    if (
      Number.isNaN(sourceIndex) ||
      sourceIndex <= 0 ||
      Number.isNaN(documentId) ||
      documentId <= 0 ||
      !quote
    ) {
      continue
    }

    parsed.push({
      sourceIndex,
      documentId,
      page: Number.isNaN(page ?? Number.NaN) ? null : page,
      quote,
    })
  }

  const byIndex = new Map<number, ParsedDocumentToolSource>()
  for (const source of parsed) {
    if (!byIndex.has(source.sourceIndex)) {
      byIndex.set(source.sourceIndex, source)
    }
  }
  return Array.from(byIndex.values())
}

function buildLibrarySourcesFromToolOutput(
  aiContent: string,
  toolOutput: string,
): LibraryCitation[] {
  if (!toolOutput.trim()) return []

  const allSources = parseDocumentSearchToolOutput(toolOutput)
  if (allSources.length === 0) return []

  const citedIndices = extractCitedIndices(aiContent)
  const selectedSources =
    citedIndices.size > 0
      ? allSources.filter((source) => citedIndices.has(source.sourceIndex))
      : allSources

  const targetSources = selectedSources.length > 0 ? selectedSources : allSources

  return targetSources.map((source) => {
    const quote = source.quote.slice(0, 240)
    return {
      citation_id: `lib-${source.sourceIndex}`,
      source_type: 'library',
      title: `Document ${source.documentId}`,
      snippet: quote.slice(0, 120),
      file_id: source.documentId,
      file_name: `document_${source.documentId}`,
      anchors: [
        {
          anchor_id: `a-fallback-${source.sourceIndex}`,
          page: source.page,
          line_start: null,
          line_end: null,
          start_char: 0,
          end_char: quote.length,
          bbox: null,
          quote,
        },
      ],
    }
  })
}

function hydrateSourcesFromToolMessages(incoming: Message[]): Message[] {
  if (incoming.length === 0) return incoming

  const hydrated = [...incoming]

  for (let i = 0; i < hydrated.length; i++) {
    const current = hydrated[i]
    if (current.role !== 'assistant') continue
    if (current.sources && current.sources.length > 0) continue
    if (extractCitedIndices(current.content).size === 0) continue

    let documentToolOutput = ''
    for (let j = i - 1; j >= 0; j--) {
      const prev = hydrated[j]
      if (prev.role === 'user') break
      if (
        prev.role === 'tool' &&
        prev.toolName === 'document_search' &&
        prev.content
      ) {
        documentToolOutput = `${prev.content}\n\n${documentToolOutput}`
      }
    }

    const fallbackSources = buildLibrarySourcesFromToolOutput(
      current.content,
      documentToolOutput,
    )
    if (fallbackSources.length === 0) continue

    hydrated[i] = {
      ...current,
      sources: fallbackSources,
    }
  }

  return hydrated
}

function mergeMessagesWithLocalState(
  current: Message[],
  incoming: Message[],
): Message[] {
  if (current.length === 0) return incoming

  const localByServerId = new Map<number, Message>()
  for (const msg of current) {
    if (msg.serverId !== null) {
      localByServerId.set(msg.serverId, msg)
    }
  }

  return incoming.map((msg) => {
    if (msg.serverId === null) return msg

    const local = localByServerId.get(msg.serverId)
    if (!local) return msg

    return {
      ...msg,
      sources:
        msg.sources && msg.sources.length > 0 ? msg.sources : local.sources,
      toolCalls:
        msg.toolCalls && msg.toolCalls.length > 0
          ? msg.toolCalls
          : local.toolCalls,
      images: msg.images && msg.images.length > 0 ? msg.images : local.images,
    }
  })
}

function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { conversationId, initialMessages, isHistoryLoading = false } = options
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [toolCall, setToolCall] = useState<ToolCallState | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const conversationIdRef = useRef(conversationId)
  const latestDocumentToolOutputRef = useRef('')

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      const hydrated = hydrateSourcesFromToolMessages(initialMessages)
      setMessages((prev) => mergeMessagesWithLocalState(prev, hydrated))
    } else if (!isHistoryLoading) {
      setMessages([])
    }
    setError(null)
    setToolCall(null)
  }, [conversationId, initialMessages, isHistoryLoading])

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    latestDocumentToolOutputRef.current = ''
    setIsStreaming(false)
  }, [])

  const handleStreamError = useCallback((err: unknown) => {
    if (err instanceof DOMException && err.name === 'AbortError') {
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        updated[updated.length - 1] = { ...last, isStreaming: false }
        return updated
      })
      setIsStreaming(false)
      latestDocumentToolOutputRef.current = ''
      return
    }

    setError(err instanceof Error ? err : new Error('알 수 없는 오류'))
    setMessages((prev) => {
      const updated = [...prev]
      const last = updated[updated.length - 1]
      updated[updated.length - 1] = {
        ...last,
        isStreaming: false,
        content: last.content || '응답 중 오류가 발생했습니다.',
      }
      return updated
    })
    setIsStreaming(false)
    setToolCall(null)
    latestDocumentToolOutputRef.current = ''
  }, [])

  const createStreamHandlers = useCallback(
    () => ({
      onToken: (token: string) => {
        setToolCall(null)
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          updated[updated.length - 1] = {
            ...last,
            content: last.content + token,
          }
          return updated
        })
      },
      onToolCall: (data: unknown) => {
        if (typeof data === 'string') {
          const parsedName = data.split(':', 1)[0]?.trim()
          setToolCall({ name: parsedName || 'tool', status: 'calling' })
          return
        }

        const parsed = data as { name?: string }
        setToolCall({ name: parsed.name ?? 'tool', status: 'calling' })
      },
      onToolResult: (data: unknown) => {
        if (
          typeof data === 'string' &&
          data.includes('[Source') &&
          data.includes('document_id=')
        ) {
          latestDocumentToolOutputRef.current = `${latestDocumentToolOutputRef.current}\n\n${data}`.trim()
        }
        setToolCall((prev) => (prev ? { ...prev, status: 'done' } : null))
      },
      onDone: (data: StreamDonePayload) => {
        const fallbackToolOutput = latestDocumentToolOutputRef.current

        setMessages((prev) => {
          if (prev.length === 0) return prev

          const updated = [...prev]

          let assistantIndex = -1
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].role === 'assistant') {
              assistantIndex = i
              break
            }
          }

          if (assistantIndex !== -1) {
            const assistantMessage = updated[assistantIndex]
            const fallbackSources =
              (!data.sources || data.sources.length === 0) && fallbackToolOutput
                ? buildLibrarySourcesFromToolOutput(
                    assistantMessage.content,
                    fallbackToolOutput,
                  )
                : []

            updated[assistantIndex] = {
              ...assistantMessage,
              isStreaming: false,
              serverId: data.ai_message_id ?? assistantMessage.serverId,
              sources:
                data.sources && data.sources.length > 0
                  ? data.sources
                  : fallbackSources,
            }
          }

          if (data.user_message_id !== undefined && data.user_message_id !== null) {
            for (let i = assistantIndex - 1; i >= 0; i--) {
              if (updated[i].role === 'user') {
                const userMessage = updated[i]
                updated[i] = {
                  ...userMessage,
                  serverId: userMessage.serverId ?? data.user_message_id,
                }
                break
              }
            }
          }

          return updated
        })
        setIsStreaming(false)
        setToolCall(null)
        latestDocumentToolOutputRef.current = ''

        if (!conversationIdRef.current && data.conversation_id) {
          conversationIdRef.current = data.conversation_id
          navigate(`/chat/${data.conversation_id}`, { replace: true })
        }

        queryClient.invalidateQueries({ queryKey: ['conversations'] })
        if (conversationIdRef.current) {
          queryClient.invalidateQueries({
            queryKey: ['conversations', conversationIdRef.current, 'messages'],
          })
        }
      },
      onError: (errorMsg: string) => {
        setError(new Error(errorMsg))
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          updated[updated.length - 1] = {
            ...last,
            isStreaming: false,
            content: last.content || '응답 중 오류가 발생했습니다.',
          }
          return updated
        })
        setIsStreaming(false)
        setToolCall(null)
        latestDocumentToolOutputRef.current = ''
      },
    }),
    [navigate, queryClient],
  )

  const sendMessage = useCallback(
    async (content: string, options?: SendMessageOptions) => {
      setError(null)
      setToolCall(null)
      latestDocumentToolOutputRef.current = ''

      const localImages: ImageSummary[] | undefined =
        options?.images && options.images.length > 0
          ? options.images.map((file, i) => {
              const blobUrl = URL.createObjectURL(file)
              return {
                id: -(i + 1),
                original_url: blobUrl,
                thumbnail_url: blobUrl,
                content_type: file.type,
                original_size: file.size,
                width: 0,
                height: 0,
                original_filename: file.name,
              }
            })
          : undefined

      const userMessage: Message = {
        id: crypto.randomUUID(),
        serverId: null,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
        images: localImages,
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        serverId: null,
        role: 'assistant',
        content: '',
        isStreaming: true,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage, assistantMessage])
      setIsStreaming(true)

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        await streamChat(
          {
            message: content,
            conversation_id: conversationIdRef.current,
            use_web_search: options?.useWebSearch,
            selected_document_ids: options?.selectedDocumentIds,
            images: options?.images,
          },
          createStreamHandlers(),
          abortController.signal,
        )
      } catch (err) {
        handleStreamError(err)
      } finally {
        abortControllerRef.current = null
      }
    },
    [createStreamHandlers, handleStreamError],
  )

  const editMessage = useCallback(
    async (messageServerId: number, newContent: string) => {
      if (!conversationIdRef.current) return

      setError(null)
      setToolCall(null)
      latestDocumentToolOutputRef.current = ''

      setMessages((prev) => {
        const targetIndex = prev.findIndex(
          (m) => m.serverId === messageServerId,
        )
        if (targetIndex === -1) return prev

        const truncated = prev.slice(0, targetIndex)
        const editedUser: Message = {
          ...prev[targetIndex],
          content: newContent,
        }
        const assistantPlaceholder: Message = {
          id: crypto.randomUUID(),
          serverId: null,
          role: 'assistant',
          content: '',
          isStreaming: true,
          createdAt: new Date().toISOString(),
        }
        return [...truncated, editedUser, assistantPlaceholder]
      })
      setIsStreaming(true)

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        await streamEditMessage(
          {
            message_id: messageServerId,
            conversation_id: conversationIdRef.current!,
            message: newContent,
          },
          createStreamHandlers(),
          abortController.signal,
        )
      } catch (err) {
        handleStreamError(err)
      } finally {
        abortControllerRef.current = null
      }
    },
    [createStreamHandlers, handleStreamError],
  )

  const regenerateMessage = useCallback(
    async (messageServerId: number) => {
      if (!conversationIdRef.current) return

      setError(null)
      setToolCall(null)
      latestDocumentToolOutputRef.current = ''

      setMessages((prev) => {
        const targetIndex = prev.findIndex(
          (m) => m.serverId === messageServerId,
        )
        if (targetIndex === -1) return prev

        const truncated = prev.slice(0, targetIndex)
        const assistantPlaceholder: Message = {
          id: crypto.randomUUID(),
          serverId: null,
          role: 'assistant',
          content: '',
          isStreaming: true,
          createdAt: new Date().toISOString(),
        }
        return [...truncated, assistantPlaceholder]
      })
      setIsStreaming(true)

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        await streamRegenerate(
          {
            message_id: messageServerId,
            conversation_id: conversationIdRef.current!,
          },
          createStreamHandlers(),
          abortController.signal,
        )
      } catch (err) {
        handleStreamError(err)
      } finally {
        abortControllerRef.current = null
      }
    },
    [createStreamHandlers, handleStreamError],
  )

  return {
    messages,
    isStreaming,
    isLoading: isHistoryLoading,
    error,
    toolCall,
    sendMessage,
    editMessage,
    regenerateMessage,
    stopStreaming,
  }
}

export { useChat }
export type { UseChatReturn, ToolCallState }
