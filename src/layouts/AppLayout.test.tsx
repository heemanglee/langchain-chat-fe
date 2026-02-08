import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { AppLayout } from './AppLayout'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useAuthStore } from '@/stores/authStore'

vi.mock('@/api/chat', () => ({
  fetchConversations: vi.fn().mockResolvedValue({
    status: 200,
    message: 'OK',
    data: { conversations: [], next_cursor: null, has_next: false },
  }),
}))

vi.mock('@/api/auth', () => ({
  logout: vi.fn().mockResolvedValue({ status: 200, message: 'OK', data: null }),
}))

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
    useParams: () => ({ conversationId: undefined }),
  }
})

vi.stubGlobal(
  'IntersectionObserver',
  vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  })),
)

describe('AppLayout', () => {
  beforeEach(() => {
    useSidebarStore.setState({ isOpen: true })
    useAuthStore.setState({
      user: {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
      isAuthenticated: true,
    })
  })

  it('renders Navbar', () => {
    renderWithProviders(<AppLayout />)
    expect(screen.getByText('RAG.OS')).toBeInTheDocument()
  })

  it('renders Sidebar', () => {
    renderWithProviders(<AppLayout />)
    expect(screen.getByText('새 채팅')).toBeInTheDocument()
  })

  it('renders Outlet', () => {
    renderWithProviders(<AppLayout />)
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('renders sidebar toggle button in navbar', () => {
    renderWithProviders(<AppLayout />)
    expect(
      screen.getByRole('button', { name: '사이드바 토글' }),
    ).toBeInTheDocument()
  })
})
