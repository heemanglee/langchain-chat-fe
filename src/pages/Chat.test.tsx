import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { Chat } from './Chat'
import { useLibraryStore } from '@/stores/libraryStore'

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

vi.mock('@/api/library', () => ({
  fetchDocuments: vi.fn().mockResolvedValue({
    status: 200,
    message: 'ok',
    data: {
      documents: [
        {
          id: 1,
          original_filename: 'doc.pdf',
          content_type: 'application/pdf',
          file_size: 1024,
          status: 'active',
          summary: null,
          summary_status: 'completed',
          index_status: 'ready',
          created_at: '2026-02-18T00:00:00Z',
          updated_at: '2026-02-18T00:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      size: 100,
    },
  }),
  reindexDocument: vi.fn().mockResolvedValue({
    status: 200,
    message: 'ok',
    data: null,
  }),
}))

describe('Chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLibraryStore.setState({ selectedIds: new Set<number>() })
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

  it('hydrates selected documents from library selection', () => {
    useLibraryStore.setState({ selectedIds: new Set<number>([1]) })
    renderWithProviders(<Chat />)

    expect(screen.getByText('문서 (1)')).toBeInTheDocument()
  })
})
