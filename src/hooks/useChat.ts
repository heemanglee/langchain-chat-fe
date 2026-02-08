import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { streamChat } from '@/api/chat'
import type { Message } from '@/types/chat'

interface ToolCallState {
  name: string
  status: 'calling' | 'done'
}

interface UseChatReturn {
  messages: Message[]
  isStreaming: boolean
  error: Error | null
  toolCall: ToolCallState | null
  sendMessage: (
    content: string,
    options?: { useWebSearch?: boolean },
  ) => Promise<void>
  stopStreaming: () => void
}

function useChat(conversationId?: string): UseChatReturn {
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
    setMessages([])
    setError(null)
    setToolCall(null)
  }, [conversationId])

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsStreaming(false)
  }, [])

  const sendMessage = useCallback(
    async (content: string, options?: { useWebSearch?: boolean }) => {
      setError(null)
      setToolCall(null)

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
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
          },
          {
            onToken: (token) => {
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
            onToolCall: (data) => {
              const parsed = data as { name?: string }
              setToolCall({ name: parsed.name ?? 'tool', status: 'calling' })
            },
            onToolResult: () => {
              setToolCall((prev) =>
                prev ? { ...prev, status: 'done' } : null,
              )
            },
            onDone: (data) => {
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

              if (
                !conversationIdRef.current &&
                data.conversation_id
              ) {
                conversationIdRef.current = data.conversation_id
                navigate(`/chat/${data.conversation_id}`, { replace: true })
              }

              queryClient.invalidateQueries({ queryKey: ['conversations'] })
            },
            onError: (errorMsg) => {
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
          },
          abortController.signal,
        )
      } catch (err) {
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
      } finally {
        abortControllerRef.current = null
      }
    },
    [navigate, queryClient],
  )

  return { messages, isStreaming, error, toolCall, sendMessage, stopStreaming }
}

export { useChat }
export type { UseChatReturn, ToolCallState }
