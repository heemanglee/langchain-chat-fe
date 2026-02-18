import { apiClient } from './client'
import { streamSSE, streamSSEWithFormData, type StreamHandlers } from './sse'
import type { ApiResponse } from '@/types/api'
import type {
  ChatRequest,
  ChatResponse,
  ConversationListResponse,
  ConversationMessagesResponse,
  EditMessageRequest,
  RegenerateRequest,
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

export function fetchConversationMessages(
  conversationId: string,
): Promise<ApiResponse<ConversationMessagesResponse>> {
  return apiClient
    .get(`api/v1/conversations/${conversationId}/messages`)
    .json()
}

export interface StreamChatOptions {
  message: string
  conversation_id?: string
  use_web_search?: boolean
  images?: File[]
}

export async function streamChat(
  request: StreamChatOptions,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const formData = new FormData()
  formData.append('message', request.message)
  if (request.conversation_id) {
    formData.append('conversation_id', request.conversation_id)
  }
  if (request.images) {
    for (const file of request.images) {
      formData.append('images', file)
    }
  }
  return streamSSEWithFormData(
    '/api/v1/chat/stream',
    formData,
    handlers,
    signal,
  )
}

export async function streamEditMessage(
  request: EditMessageRequest,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return streamSSE('/api/v1/chat/edit', request, handlers, signal)
}

export async function streamRegenerate(
  request: RegenerateRequest,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return streamSSE('/api/v1/chat/regenerate', request, handlers, signal)
}
