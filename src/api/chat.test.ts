import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sendMessage,
  fetchConversations,
  fetchConversationMessages,
  streamChat,
  streamEditMessage,
  streamRegenerate,
} from './chat'

vi.mock('./client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('./sse', () => ({
  streamSSE: vi.fn(),
  streamSSEWithFormData: vi.fn(),
}))

import { apiClient } from './client'
import { streamSSE, streamSSEWithFormData } from './sse'

const mockPost = vi.mocked(apiClient.post)
const mockGet = vi.mocked(apiClient.get)
const mockStreamSSE = vi.mocked(streamSSE)
const mockStreamSSEWithFormData = vi.mocked(streamSSEWithFormData)

describe('chat API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendMessage', () => {
    it('sends POST request with chat data', async () => {
      const mockResponse = {
        status: 200,
        message: 'OK',
        data: {
          message: '응답입니다',
          conversation_id: 'c1',
          session_id: 1,
          sources: [],
          created_at: '2024-01-01T00:00:00Z',
        },
      }

      mockPost.mockReturnValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as never)

      const result = await sendMessage({
        message: '안녕하세요',
        conversation_id: 'c1',
      })

      expect(mockPost).toHaveBeenCalledWith('api/v1/chat', {
        json: { message: '안녕하세요', conversation_id: 'c1' },
      })
      expect(result.data?.message).toBe('응답입니다')
    })
  })

  describe('fetchConversations', () => {
    it('sends GET request with params', async () => {
      const mockResponse = {
        status: 200,
        message: 'OK',
        data: {
          conversations: [],
          next_cursor: null,
          has_next: false,
        },
      }

      mockGet.mockReturnValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as never)

      const result = await fetchConversations({ limit: 20 })

      expect(mockGet).toHaveBeenCalledWith('api/v1/conversations', {
        searchParams: { limit: 20 },
      })
      expect(result.data?.conversations).toEqual([])
    })

    it('sends GET request without params', async () => {
      mockGet.mockReturnValue({
        json: vi.fn().mockResolvedValue({
          status: 200,
          message: 'OK',
          data: { conversations: [], next_cursor: null, has_next: false },
        }),
      } as never)

      await fetchConversations()

      expect(mockGet).toHaveBeenCalledWith('api/v1/conversations', {
        searchParams: {},
      })
    })
  })

  describe('fetchConversationMessages', () => {
    it('sends GET request for conversation messages', async () => {
      const mockResponse = {
        status: 200,
        message: 'OK',
        data: {
          conversation_id: 'c1',
          messages: [
            {
              id: 1,
              session_id: 1,
              role: 'human',
              content: 'Hello',
              tool_calls_json: null,
              tool_call_id: null,
              tool_name: null,
              created_at: '2024-01-01T00:00:00Z',
            },
          ],
        },
      }

      mockGet.mockReturnValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as never)

      const result = await fetchConversationMessages('c1')

      expect(mockGet).toHaveBeenCalledWith('api/v1/conversations/c1/messages')
      expect(result.data?.messages).toHaveLength(1)
    })
  })

  describe('streamChat', () => {
    it('delegates to streamSSEWithFormData with FormData', async () => {
      const handlers = {
        onToken: vi.fn(),
        onDone: vi.fn(),
        onError: vi.fn(),
      }
      const signal = new AbortController().signal

      await streamChat({ message: 'test' }, handlers, signal)

      expect(mockStreamSSEWithFormData).toHaveBeenCalledWith(
        '/api/v1/chat/stream',
        expect.any(FormData),
        handlers,
        signal,
      )

      const formData = mockStreamSSEWithFormData.mock.calls[0][1] as FormData
      expect(formData.get('message')).toBe('test')
      expect(formData.get('conversation_id')).toBeNull()
    })

    it('includes conversation_id in FormData when provided', async () => {
      const handlers = {
        onToken: vi.fn(),
        onDone: vi.fn(),
        onError: vi.fn(),
      }

      await streamChat(
        { message: 'test', conversation_id: 'c1' },
        handlers,
      )

      const formData = mockStreamSSEWithFormData.mock.calls[0][1] as FormData
      expect(formData.get('message')).toBe('test')
      expect(formData.get('conversation_id')).toBe('c1')
    })

    it('appends images to FormData when provided', async () => {
      const handlers = {
        onToken: vi.fn(),
        onDone: vi.fn(),
        onError: vi.fn(),
      }
      const file = new File(['img'], 'test.png', { type: 'image/png' })

      await streamChat(
        { message: 'test', images: [file] },
        handlers,
      )

      const formData = mockStreamSSEWithFormData.mock.calls[0][1] as FormData
      expect(formData.get('message')).toBe('test')
      expect(formData.getAll('images')).toHaveLength(1)
    })

    it('appends selected_document_ids as JSON when provided', async () => {
      const handlers = {
        onToken: vi.fn(),
        onDone: vi.fn(),
        onError: vi.fn(),
      }

      await streamChat(
        { message: 'test', selected_document_ids: [1, 3] },
        handlers,
      )

      const formData = mockStreamSSEWithFormData.mock.calls[0][1] as FormData
      expect(formData.get('selected_document_ids')).toBe('[1,3]')
    })
  })

  describe('streamEditMessage', () => {
    it('delegates to streamSSE with correct URL', async () => {
      const handlers = {
        onToken: vi.fn(),
        onDone: vi.fn(),
        onError: vi.fn(),
      }

      await streamEditMessage(
        { message_id: 1, conversation_id: 'c1', message: 'edited' },
        handlers,
      )

      expect(mockStreamSSE).toHaveBeenCalledWith(
        '/api/v1/chat/edit',
        { message_id: 1, conversation_id: 'c1', message: 'edited' },
        handlers,
        undefined,
      )
    })
  })

  describe('streamRegenerate', () => {
    it('delegates to streamSSE with correct URL', async () => {
      const handlers = {
        onToken: vi.fn(),
        onDone: vi.fn(),
        onError: vi.fn(),
      }

      await streamRegenerate(
        { message_id: 2, conversation_id: 'c1' },
        handlers,
      )

      expect(mockStreamSSE).toHaveBeenCalledWith(
        '/api/v1/chat/regenerate',
        { message_id: 2, conversation_id: 'c1' },
        handlers,
        undefined,
      )
    })
  })
})
