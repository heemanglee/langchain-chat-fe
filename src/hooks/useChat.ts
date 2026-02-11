import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { streamChat, streamEditMessage, streamRegenerate } from '@/api/chat'
import type { ImageSummary, Message } from '@/types/chat'

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
  sendMessage: (
    content: string,
    options?: { useWebSearch?: boolean; images?: File[] },
  ) => Promise<void>
  editMessage: (messageServerId: number, newContent: string) => Promise<void>
  regenerateMessage: (messageServerId: number) => Promise<void>
  stopStreaming: () => void
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

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages)
    } else if (!isHistoryLoading) {
      setMessages([])
    }
    setError(null)
    setToolCall(null)
  }, [conversationId, initialMessages, isHistoryLoading])

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
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
        const parsed = data as { name?: string }
        setToolCall({ name: parsed.name ?? 'tool', status: 'calling' })
      },
      onToolResult: () => {
        setToolCall((prev) => (prev ? { ...prev, status: 'done' } : null))
      },
      onDone: (data: { conversation_id: string; sources: string[] }) => {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          updated[updated.length - 1] = {
            ...last,
            isStreaming: false,
            sources: data.sources,
          }
          return updated
        })
        setIsStreaming(false)
        setToolCall(null)

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
      },
    }),
    [navigate, queryClient],
  )

  const sendMessage = useCallback(
    async (content: string, options?: { useWebSearch?: boolean; images?: File[] }) => {
      setError(null)
      setToolCall(null)

      const localImages: ImageSummary[] | undefined =
        options?.images && options.images.length > 0
          ? options.images.map((file, i) => ({
              id: -(i + 1),
              original_url: URL.createObjectURL(file),
              thumbnail_url: URL.createObjectURL(file),
              content_type: file.type,
              original_size: file.size,
              width: 0,
              height: 0,
              original_filename: file.name,
            }))
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
