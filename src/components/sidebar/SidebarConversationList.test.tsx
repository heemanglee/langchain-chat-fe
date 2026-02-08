import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { SidebarConversationList } from './SidebarConversationList'

vi.mock('@/api/chat', () => ({
  fetchConversations: vi.fn(),
}))

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return { ...actual, useParams: () => ({ conversationId: undefined }) }
})

import { fetchConversations } from '@/api/chat'

const mockFetchConversations = vi.mocked(fetchConversations)

// IntersectionObserver mock
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
vi.stubGlobal(
  'IntersectionObserver',
  vi.fn(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: vi.fn(),
  })),
)

describe('SidebarConversationList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading spinner initially', () => {
    mockFetchConversations.mockReturnValue(new Promise(() => {}))
    const { container } = renderWithProviders(<SidebarConversationList />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('shows empty state when no conversations', async () => {
    mockFetchConversations.mockResolvedValueOnce({
      status: 200,
      message: 'OK',
      data: { conversations: [], next_cursor: null, has_next: false },
    })

    renderWithProviders(<SidebarConversationList />)

    expect(
      await screen.findByText('아직 대화가 없습니다'),
    ).toBeInTheDocument()
  })

  it('renders conversation list', async () => {
    mockFetchConversations.mockResolvedValueOnce({
      status: 200,
      message: 'OK',
      data: {
        conversations: [
          {
            conversation_id: 'c1',
            title: '첫 번째 대화',
            last_message_preview: '안녕하세요',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            conversation_id: 'c2',
            title: '두 번째 대화',
            last_message_preview: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        next_cursor: null,
        has_next: false,
      },
    })

    renderWithProviders(<SidebarConversationList />)

    expect(await screen.findByText('첫 번째 대화')).toBeInTheDocument()
    expect(screen.getByText('두 번째 대화')).toBeInTheDocument()
  })

  it('shows error message on fetch failure', async () => {
    mockFetchConversations.mockRejectedValueOnce(new Error('Network error'))

    renderWithProviders(<SidebarConversationList />)

    expect(
      await screen.findByText('대화 목록을 불러올 수 없습니다'),
    ).toBeInTheDocument()
  })
})
