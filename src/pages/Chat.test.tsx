import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { Chat } from './Chat'

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useParams: () => ({ conversationId: undefined }),
    useNavigate: () => vi.fn(),
  }
})

vi.mock('@/api/chat', () => ({
  streamChat: vi.fn(),
  streamEditMessage: vi.fn(),
  streamRegenerate: vi.fn(),
  fetchConversationMessages: vi.fn(),
}))

describe('Chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders welcome screen when no messages', () => {
    renderWithProviders(<Chat />)
    expect(screen.getByText('무엇을 도와드릴까요?')).toBeInTheDocument()
  })

  it('renders chat input', () => {
    renderWithProviders(<Chat />)
    expect(
      screen.getByPlaceholderText('메시지를 입력하세요...'),
    ).toBeInTheDocument()
  })

  it('renders send button', () => {
    renderWithProviders(<Chat />)
    expect(
      screen.getByRole('button', { name: '메시지 전송' }),
    ).toBeInTheDocument()
  })

  it('renders web search toggle', () => {
    renderWithProviders(<Chat />)
    expect(
      screen.getByRole('button', { name: '웹 검색 꺼짐' }),
    ).toBeInTheDocument()
  })
})
