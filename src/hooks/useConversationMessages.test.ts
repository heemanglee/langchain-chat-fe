import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useConversationMessages } from './useConversationMessages'
import { AllProviders } from '@/test/utils'

vi.mock('@/api/chat', () => ({
  fetchConversationMessages: vi.fn(),
}))

import { fetchConversationMessages } from '@/api/chat'

const mockFetch = vi.mocked(fetchConversationMessages)

describe('useConversationMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not fetch when conversationId is undefined', () => {
    renderHook(() => useConversationMessages(undefined), {
      wrapper: AllProviders,
    })

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches messages when conversationId is provided', async () => {
    mockFetch.mockResolvedValueOnce({
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
          {
            id: 2,
            session_id: 1,
            role: 'ai',
            content: 'Hi there',
            tool_calls_json: null,
            tool_call_id: null,
            tool_name: null,
            created_at: '2024-01-01T00:00:01Z',
          },
        ],
      },
    })

    const { result } = renderHook(() => useConversationMessages('c1'), {
      wrapper: AllProviders,
    })

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2)
    })

    expect(result.current.data![0].role).toBe('user')
    expect(result.current.data![0].serverId).toBe(1)
    expect(result.current.data![1].role).toBe('assistant')
    expect(result.current.data![1].content).toBe('Hi there')
  })

  it('returns empty array when data is null', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      message: 'OK',
      data: null,
    })

    const { result } = renderHook(() => useConversationMessages('c1'), {
      wrapper: AllProviders,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([])
  })
})
