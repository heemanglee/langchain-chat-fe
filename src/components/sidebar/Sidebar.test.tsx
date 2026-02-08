import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { Sidebar } from './Sidebar'
import { useSidebarStore } from '@/stores/sidebarStore'

vi.mock('@/api/chat', () => ({
  fetchConversations: vi.fn().mockResolvedValue({
    status: 200,
    message: 'OK',
    data: { conversations: [], next_cursor: null, has_next: false },
  }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSidebarStore.setState({ isOpen: true })
  })

  it('renders new chat button', () => {
    renderWithProviders(<Sidebar />)
    expect(screen.getByText('새 채팅')).toBeInTheDocument()
  })

  it('renders navigation items', () => {
    renderWithProviders(<Sidebar />)
    expect(screen.getByText('라이브러리')).toBeInTheDocument()
    expect(screen.getByText('에이전트')).toBeInTheDocument()
  })

  it('renders recent conversations header', () => {
    renderWithProviders(<Sidebar />)
    expect(screen.getByText('최근 대화')).toBeInTheDocument()
  })

  it('navigates to /chat on new chat click', async () => {
    const { user } = renderWithProviders(<Sidebar />)

    await user.click(screen.getByText('새 채팅'))
    expect(mockNavigate).toHaveBeenCalledWith('/chat')
  })

  it('is hidden when isOpen is false', () => {
    useSidebarStore.setState({ isOpen: false })
    renderWithProviders(<Sidebar />)

    const aside = screen.getByRole('complementary')
    expect(aside.className).toContain('-translate-x-full')
  })

  it('is visible when isOpen is true', () => {
    useSidebarStore.setState({ isOpen: true })
    renderWithProviders(<Sidebar />)

    const aside = screen.getByRole('complementary')
    expect(aside.className).toContain('translate-x-0')
  })

  it('disables library and agents buttons', () => {
    renderWithProviders(<Sidebar />)
    expect(screen.getByText('라이브러리').closest('button')).toBeDisabled()
    expect(screen.getByText('에이전트').closest('button')).toBeDisabled()
  })
})
