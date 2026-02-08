import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useConversations } from './useConversations'
import { AllProviders } from '@/test/utils'

vi.mock('@/api/chat', () => ({
  fetchConversations: vi.fn(),
}))

import { fetchConversations } from '@/api/chat'

const mockFetchConversations = vi.mocked(fetchConversations)

describe('useConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches conversations on mount', async () => {
    mockFetchConversations.mockResolvedValueOnce({
      status: 200,
      message: 'OK',
      data: {
        conversations: [
          {
            conversation_id: 'c1',
            title: '테스트 대화',
            last_message_preview: '안녕하세요',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        next_cursor: null,
        has_next: false,
      },
    })

    const { result } = renderHook(() => useConversations(), {
      wrapper: AllProviders,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.conversations).toHaveLength(1)
    expect(result.current.data?.conversations[0].title).toBe('테스트 대화')
  })

  it('returns empty conversations on no data', async () => {
    mockFetchConversations.mockResolvedValueOnce({
      status: 200,
      message: 'OK',
      data: {
        conversations: [],
        next_cursor: null,
        has_next: false,
      },
    })

    const { result } = renderHook(() => useConversations(), {
      wrapper: AllProviders,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.conversations).toHaveLength(0)
    expect(result.current.data?.hasNextPage).toBe(false)
  })

  it('sets hasNextPage when more pages available', async () => {
    mockFetchConversations.mockResolvedValueOnce({
      status: 200,
      message: 'OK',
      data: {
        conversations: [
          {
            conversation_id: 'c1',
            title: '대화 1',
            last_message_preview: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        next_cursor: 'cursor-abc',
        has_next: true,
      },
    })

    const { result } = renderHook(() => useConversations(), {
      wrapper: AllProviders,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.hasNextPage).toBe(true)
    expect(result.current.hasNextPage).toBe(true)
  })

  it('handles fetch error', async () => {
    mockFetchConversations.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useConversations(), {
      wrapper: AllProviders,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeInstanceOf(Error)
  })
})
