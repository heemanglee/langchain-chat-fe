import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChat } from './useChat'
import { AllProviders } from '@/test/utils'

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/api/chat', () => ({
  streamChat: vi.fn(),
  streamEditMessage: vi.fn(),
  streamRegenerate: vi.fn(),
}))

import { streamChat, streamEditMessage, streamRegenerate } from '@/api/chat'

const mockStreamChat = vi.mocked(streamChat)
const mockStreamEditMessage = vi.mocked(streamEditMessage)
const mockStreamRegenerate = vi.mocked(streamRegenerate)

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: AllProviders,
    })

    expect(result.current.messages).toEqual([])
    expect(result.current.isStreaming).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.toolCall).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('adds user and assistant messages when sending', async () => {
    mockStreamChat.mockImplementation(async (_req, handlers) => {
      handlers.onToken('안녕')
      handlers.onDone({ conversation_id: 'c1', sources: [] })
    })

    const { result } = renderHook(() => useChat(), {
      wrapper: AllProviders,
    })

    await act(async () => {
      await result.current.sendMessage('안녕하세요')
    })

    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[0].role).toBe('user')
    expect(result.current.messages[0].content).toBe('안녕하세요')
    expect(result.current.messages[0].serverId).toBeNull()
    expect(result.current.messages[1].role).toBe('assistant')
    expect(result.current.messages[1].content).toBe('안녕')
  })

  it('navigates to new conversation on first message', async () => {
    mockStreamChat.mockImplementation(async (_req, handlers) => {
      handlers.onToken('응답')
      handlers.onDone({ conversation_id: 'new-conv', sources: [] })
    })

    const { result } = renderHook(() => useChat(), {
      wrapper: AllProviders,
    })

    await act(async () => {
      await result.current.sendMessage('첫 메시지')
    })

    expect(mockNavigate).toHaveBeenCalledWith('/chat/new-conv', {
      replace: true,
    })
  })

  it('does not navigate when conversationId already exists', async () => {
    mockStreamChat.mockImplementation(async (_req, handlers) => {
      handlers.onDone({ conversation_id: 'existing', sources: [] })
    })

    const { result } = renderHook(
      () => useChat({ conversationId: 'existing' }),
      {
        wrapper: AllProviders,
      },
    )

    await act(async () => {
      await result.current.sendMessage('메시지')
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('handles tool call events', async () => {
    mockStreamChat.mockImplementation(async (_req, handlers) => {
      handlers.onToolCall?.({ name: 'web_search' })
      handlers.onToolResult?.({})
      handlers.onDone({ conversation_id: 'c1', sources: [] })
    })

    const { result } = renderHook(() => useChat(), {
      wrapper: AllProviders,
    })

    await act(async () => {
      await result.current.sendMessage('검색해줘')
    })

    expect(result.current.toolCall).toBeNull()
    expect(result.current.isStreaming).toBe(false)
  })

  it('handles error from stream', async () => {
    mockStreamChat.mockImplementation(async (_req, handlers) => {
      handlers.onError('서버 오류')
    })

    const { result } = renderHook(() => useChat(), {
      wrapper: AllProviders,
    })

    await act(async () => {
      await result.current.sendMessage('메시지')
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('서버 오류')
    expect(result.current.isStreaming).toBe(false)
  })

  it('handles network error', async () => {
    mockStreamChat.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useChat(), {
      wrapper: AllProviders,
    })

    await act(async () => {
      await result.current.sendMessage('메시지')
    })

    expect(result.current.error?.message).toBe('Network error')
    expect(result.current.isStreaming).toBe(false)
  })

  it('resets messages when conversationId changes', () => {
    const { result, rerender } = renderHook(
      ({ id }) => useChat({ conversationId: id }),
      {
        wrapper: AllProviders,
        initialProps: { id: 'conv-1' as string | undefined },
      },
    )

    expect(result.current.messages).toEqual([])

    rerender({ id: 'conv-2' })
    expect(result.current.messages).toEqual([])
  })

  it('passes useWebSearch option to streamChat', async () => {
    mockStreamChat.mockImplementation(async (_req, handlers) => {
      handlers.onDone({ conversation_id: 'c1', sources: [] })
    })

    const { result } = renderHook(() => useChat(), {
      wrapper: AllProviders,
    })

    await act(async () => {
      await result.current.sendMessage('검색', { useWebSearch: true })
    })

    expect(mockStreamChat).toHaveBeenCalledWith(
      expect.objectContaining({ use_web_search: true }),
      expect.any(Object),
      expect.any(AbortSignal),
    )
  })

  it('uses initialMessages when provided', () => {
    const initialMessages = [
      {
        id: '1',
        serverId: 1,
        role: 'user' as const,
        content: '히스토리 메시지',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        serverId: 2,
        role: 'assistant' as const,
        content: '히스토리 응답',
        createdAt: '2024-01-01T00:00:01Z',
      },
    ]

    const { result } = renderHook(
      () =>
        useChat({
          conversationId: 'conv-1',
          initialMessages,
        }),
      { wrapper: AllProviders },
    )

    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[0].content).toBe('히스토리 메시지')
    expect(result.current.messages[1].content).toBe('히스토리 응답')
  })

  it('reports isLoading from isHistoryLoading', () => {
    const { result } = renderHook(
      () =>
        useChat({
          conversationId: 'conv-1',
          isHistoryLoading: true,
        }),
      { wrapper: AllProviders },
    )

    expect(result.current.isLoading).toBe(true)
  })

  describe('editMessage', () => {
    it('truncates messages and starts new stream', async () => {
      const initialMessages = [
        {
          id: '1',
          serverId: 10,
          role: 'user' as const,
          content: '원래 질문',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          serverId: 11,
          role: 'assistant' as const,
          content: '원래 응답',
          createdAt: '2024-01-01T00:00:01Z',
        },
      ]

      mockStreamEditMessage.mockImplementation(async (_req, handlers) => {
        handlers.onToken('새 응답')
        handlers.onDone({ conversation_id: 'c1', sources: [] })
      })

      const { result } = renderHook(
        () =>
          useChat({
            conversationId: 'c1',
            initialMessages,
          }),
        { wrapper: AllProviders },
      )

      await act(async () => {
        await result.current.editMessage(10, '수정된 질문')
      })

      expect(result.current.messages).toHaveLength(2)
      expect(result.current.messages[0].content).toBe('수정된 질문')
      expect(result.current.messages[1].content).toBe('새 응답')
      expect(mockStreamEditMessage).toHaveBeenCalledWith(
        { message_id: 10, conversation_id: 'c1', message: '수정된 질문' },
        expect.any(Object),
        expect.any(AbortSignal),
      )
    })

    it('does nothing without conversationId', async () => {
      const { result } = renderHook(() => useChat(), {
        wrapper: AllProviders,
      })

      await act(async () => {
        await result.current.editMessage(1, '수정')
      })

      expect(mockStreamEditMessage).not.toHaveBeenCalled()
    })
  })

  describe('regenerateMessage', () => {
    it('truncates from target and starts new stream', async () => {
      const initialMessages = [
        {
          id: '1',
          serverId: 10,
          role: 'user' as const,
          content: '질문',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          serverId: 11,
          role: 'assistant' as const,
          content: '원래 응답',
          createdAt: '2024-01-01T00:00:01Z',
        },
      ]

      mockStreamRegenerate.mockImplementation(async (_req, handlers) => {
        handlers.onToken('재생성된 응답')
        handlers.onDone({ conversation_id: 'c1', sources: [] })
      })

      const { result } = renderHook(
        () =>
          useChat({
            conversationId: 'c1',
            initialMessages,
          }),
        { wrapper: AllProviders },
      )

      await act(async () => {
        await result.current.regenerateMessage(11)
      })

      expect(result.current.messages).toHaveLength(2)
      expect(result.current.messages[0].content).toBe('질문')
      expect(result.current.messages[1].content).toBe('재생성된 응답')
      expect(mockStreamRegenerate).toHaveBeenCalledWith(
        { message_id: 11, conversation_id: 'c1' },
        expect.any(Object),
        expect.any(AbortSignal),
      )
    })

    it('does nothing without conversationId', async () => {
      const { result } = renderHook(() => useChat(), {
        wrapper: AllProviders,
      })

      await act(async () => {
        await result.current.regenerateMessage(1)
      })

      expect(mockStreamRegenerate).not.toHaveBeenCalled()
    })
  })
})
