import { apiClient } from './client'
import { streamSSE, type StreamHandlers } from './sse'
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

export async function streamChat(
  request: ChatRequest,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return streamSSE('/api/v1/chat/stream', request, handlers, signal)
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
