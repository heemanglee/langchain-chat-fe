import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChat } from './useChat'
import { AllProviders } from '@/test/utils'
import type { Message } from '@/types/chat'

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

  it('passes selectedDocumentIds option to streamChat', async () => {
    mockStreamChat.mockImplementation(async (_req, handlers) => {
      handlers.onDone({ conversation_id: 'c1', sources: [] })
    })

    const { result } = renderHook(() => useChat(), {
      wrapper: AllProviders,
    })

    await act(async () => {
      await result.current.sendMessage('문서 질문', { selectedDocumentIds: [2, 4] })
    })

    expect(mockStreamChat).toHaveBeenCalledWith(
      expect.objectContaining({ selected_document_ids: [2, 4] }),
      expect.any(Object),
      expect.any(AbortSignal),
    )
  })

  it('preserves streamed sources when history payload has no sources', async () => {
    const streamedSources = [
      {
        citation_id: 'lib-1',
        source_type: 'library' as const,
        title: 'doc.pdf',
        snippet: '인용 스니펫',
        file_id: 15,
        file_name: 'doc.pdf',
        anchors: [
          {
            anchor_id: 'a-1',
            page: 1,
            line_start: null,
            line_end: null,
            start_char: 0,
            end_char: 32,
            bbox: null,
            quote: '인용 텍스트',
          },
        ],
      },
    ]

    mockStreamChat.mockImplementation(async (_req, handlers) => {
      handlers.onToken('요약 결과 [cite:1]')
      handlers.onDone({
        conversation_id: 'c1',
        user_message_id: 101,
        ai_message_id: 102,
        sources: streamedSources,
      })
    })

    const { result, rerender } = renderHook(
      ({ id, initial, loading }) =>
        useChat({
          conversationId: id,
          initialMessages: initial,
          isHistoryLoading: loading,
        }),
      {
        wrapper: AllProviders,
        initialProps: {
          id: undefined as string | undefined,
          initial: undefined as Message[] | undefined,
          loading: false,
        },
      },
    )

    await act(async () => {
      await result.current.sendMessage('문서 요약해')
    })

    expect(result.current.messages[1].sources).toEqual(streamedSources)

    rerender({
      id: 'c1',
      loading: false,
      initial: [
        {
          id: '101',
          serverId: 101,
          role: 'user',
          content: '문서 요약해',
          createdAt: '2026-02-18T00:00:00Z',
        },
        {
          id: '102',
          serverId: 102,
          role: 'assistant',
          content: '요약 결과 [cite:1]',
          createdAt: '2026-02-18T00:00:01Z',
        },
      ],
    })

    expect(result.current.messages[1].sources).toEqual(streamedSources)
  })

  it('builds fallback sources from document_search tool_result when done sources are empty', async () => {
    mockStreamChat.mockImplementation(async (_req, handlers) => {
      handlers.onToolCall?.('document_search: {"query":"문서 요약"}')
      handlers.onToolResult?.(
        '[Source 3: document_id=15 (page 2)]\n벡터 임베딩 관련 인용 텍스트',
      )
      handlers.onToken('요약 결과입니다. [cite:3]')
      handlers.onDone({
        conversation_id: 'c1',
        user_message_id: 201,
        ai_message_id: 202,
        sources: [],
      })
    })

    const { result } = renderHook(() => useChat(), {
      wrapper: AllProviders,
    })

    await act(async () => {
      await result.current.sendMessage('문서 요약해')
    })

    expect(result.current.messages[1].sources?.[0]).toMatchObject({
      citation_id: 'lib-3',
      source_type: 'library',
      file_id: 15,
    })
  })

  it('hydrates fallback sources from stored tool messages', () => {
    const toolContent =
      '[Source 3: document_id=15 (page 2)]\n벡터 임베딩 관련 인용 텍스트'

    const initialMessages: Message[] = [
      {
        id: '301',
        serverId: 301,
        role: 'user',
        content: '문서 요약해',
        createdAt: '2026-02-18T00:00:00Z',
      },
      {
        id: '302',
        serverId: 302,
        role: 'tool',
        content: toolContent,
        createdAt: '2026-02-18T00:00:01Z',
        toolName: 'document_search',
      },
      {
        id: '303',
        serverId: 303,
        role: 'assistant',
        content: '요약 결과입니다. [cite:3]',
        createdAt: '2026-02-18T00:00:02Z',
      },
    ]

    const { result } = renderHook(
      () =>
        useChat({
          conversationId: 'c1',
          initialMessages,
          isHistoryLoading: false,
        }),
      { wrapper: AllProviders },
    )

    expect(result.current.messages[2].sources?.[0]).toMatchObject({
      citation_id: 'lib-3',
      source_type: 'library',
      file_id: 15,
    })
  })

  it('hydrates fallback sources when localized citation marker is used', () => {
    const toolContent =
      '[Source 3: document_id=15 (page 2)]\n벡터 임베딩 관련 인용 텍스트'

    const initialMessages: Message[] = [
      {
        id: '401',
        serverId: 401,
        role: 'user',
        content: '문서 요약해',
        createdAt: '2026-02-18T00:00:00Z',
      },
      {
        id: '402',
        serverId: 402,
        role: 'tool',
        content: toolContent,
        createdAt: '2026-02-18T00:00:01Z',
        toolName: 'document_search',
      },
      {
        id: '403',
        serverId: 403,
        role: 'assistant',
        content: '요약 결과입니다. [시민투입:3]',
        createdAt: '2026-02-18T00:00:02Z',
      },
    ]

    const { result } = renderHook(
      () =>
        useChat({
          conversationId: 'c1',
          initialMessages,
          isHistoryLoading: false,
        }),
      { wrapper: AllProviders },
    )

    expect(result.current.messages[2].sources?.[0]).toMatchObject({
      citation_id: 'lib-3',
      source_type: 'library',
      file_id: 15,
    })
  })

  it('hydrates fallback sources when localized marker uses full-width colon', () => {
    const toolContent =
      '[Source 4: document_id=19 (page 5)]\n풀와이드 콜론 인용 텍스트'

    const initialMessages: Message[] = [
      {
        id: '501',
        serverId: 501,
        role: 'user',
        content: '문서 요약해',
        createdAt: '2026-02-18T00:00:00Z',
      },
      {
        id: '502',
        serverId: 502,
        role: 'tool',
        content: toolContent,
        createdAt: '2026-02-18T00:00:01Z',
        toolName: 'document_search',
      },
      {
        id: '503',
        serverId: 503,
        role: 'assistant',
        content: '요약 결과입니다. [시민투입：4]',
        createdAt: '2026-02-18T00:00:02Z',
      },
    ]

    const { result } = renderHook(
      () =>
        useChat({
          conversationId: 'c1',
          initialMessages,
          isHistoryLoading: false,
        }),
      { wrapper: AllProviders },
    )

    expect(result.current.messages[2].sources?.[0]).toMatchObject({
      citation_id: 'lib-4',
      source_type: 'library',
      file_id: 19,
    })
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
