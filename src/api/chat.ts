import { apiClient } from './client'
import type { ApiResponse } from '@/types/api'
import type {
  ChatRequest,
  ChatResponse,
  ConversationListResponse,
} from '@/types/chat'

export function sendMessage(
  data: ChatRequest,
): Promise<ApiResponse<ChatResponse>> {
  return apiClient.post('api/v1/chat', { json: data }).json()
}

export function fetchConversations(params?: {
  cursor?: string
  limit?: number
}): Promise<ApiResponse<ConversationListResponse>> {
  return apiClient
    .get('api/v1/conversations', { searchParams: params ?? {} })
    .json()
}

export async function streamChat(
  request: ChatRequest,
  handlers: {
    onToken: (token: string) => void
    onToolCall?: (data: unknown) => void
    onToolResult?: (data: unknown) => void
    onDone: (data: { conversation_id: string; sources: string[] }) => void
    onError: (error: string) => void
  },
  signal?: AbortSignal,
): Promise<void> {
  const token = localStorage.getItem('access_token')
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8004'

  const response = await fetch(`${baseUrl}/api/v1/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue

      try {
        const parsed = JSON.parse(trimmed.slice(6)) as {
          event: string
          data: unknown
        }

        switch (parsed.event) {
          case 'token':
            handlers.onToken(parsed.data as string)
            break
          case 'tool_call':
            handlers.onToolCall?.(parsed.data)
            break
          case 'tool_result':
            handlers.onToolResult?.(parsed.data)
            break
          case 'done':
            handlers.onDone(
              parsed.data as { conversation_id: string; sources: string[] },
            )
            break
          case 'error':
            handlers.onError(parsed.data as string)
            break
        }
      } catch {
        // skip malformed SSE lines
      }
    }
  }
}
