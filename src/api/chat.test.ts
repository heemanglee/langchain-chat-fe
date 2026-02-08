import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendMessage, fetchConversations, streamChat } from './chat'

vi.mock('./client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import { apiClient } from './client'

const mockPost = vi.mocked(apiClient.post)
const mockGet = vi.mocked(apiClient.get)

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

  describe('streamChat', () => {
    it('calls handlers for SSE events', async () => {
      const handlers = {
        onToken: vi.fn(),
        onToolCall: vi.fn(),
        onToolResult: vi.fn(),
        onDone: vi.fn(),
        onError: vi.fn(),
      }

      const encoder = new TextEncoder()
      const sseData = [
        'data: {"event":"token","data":"Hello"}\n\n',
        'data: {"event":"tool_call","data":{"name":"search"}}\n\n',
        'data: {"event":"tool_result","data":{"result":"found"}}\n\n',
        'data: {"event":"done","data":{"conversation_id":"c1","sources":["s1"]}}\n\n',
      ].join('')

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseData))
          controller.close()
        },
      })

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(stream, { status: 200 }),
      )

      await streamChat({ message: 'test' }, handlers)

      expect(handlers.onToken).toHaveBeenCalledWith('Hello')
      expect(handlers.onToolCall).toHaveBeenCalledWith({ name: 'search' })
      expect(handlers.onToolResult).toHaveBeenCalledWith({ result: 'found' })
      expect(handlers.onDone).toHaveBeenCalledWith({
        conversation_id: 'c1',
        sources: ['s1'],
      })
    })

    it('throws on non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(null, { status: 500 }),
      )

      const handlers = {
        onToken: vi.fn(),
        onDone: vi.fn(),
        onError: vi.fn(),
      }

      await expect(
        streamChat({ message: 'test' }, handlers),
      ).rejects.toThrow('Stream request failed: 500')
    })

    it('skips malformed SSE lines', async () => {
      const encoder = new TextEncoder()
      const sseData =
        'data: not json\ndata: {"event":"token","data":"ok"}\n\n'

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseData))
          controller.close()
        },
      })

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(stream, { status: 200 }),
      )

      const handlers = {
        onToken: vi.fn(),
        onDone: vi.fn(),
        onError: vi.fn(),
      }

      await streamChat({ message: 'test' }, handlers)

      expect(handlers.onToken).toHaveBeenCalledWith('ok')
    })
  })
})
