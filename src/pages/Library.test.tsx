import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { Library } from './Library'

vi.mock('@/api/library', () => ({
  fetchDocuments: vi.fn().mockResolvedValue({
    status: 200,
    message: 'ok',
    data: {
      documents: [
        {
          id: 1,
          original_filename: 'report.pdf',
          content_type: 'application/pdf',
          file_size: 1048576,
          status: 'active',
          summary: 'A quarterly report',
          summary_status: 'completed',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      size: 20,
    },
  }),
  fetchStorageUsage: vi.fn().mockResolvedValue({
    status: 200,
    message: 'ok',
    data: { used_bytes: 1048576, max_bytes: 104857600, document_count: 1 },
  }),
  fetchDocumentDetail: vi.fn(),
  uploadDocument: vi.fn(),
}))

describe('Library Page', () => {
  it('라이브러리 헤더와 문서 목록을 렌더링한다', async () => {
    renderWithProviders(<Library />)

    expect(screen.getByText('라이브러리')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('report.pdf')).toBeInTheDocument()
    })
  })

  it('스토리지 사용량을 표시한다', async () => {
    renderWithProviders(<Library />)

    await waitFor(() => {
      expect(screen.getByText(/사용 중/)).toBeInTheDocument()
    })
  })

  it('필터 토글 버튼을 표시한다', () => {
    renderWithProviders(<Library />)

    expect(screen.getByText('활성')).toBeInTheDocument()
    expect(screen.getByText('전체')).toBeInTheDocument()
  })

  it('업로드 버튼을 표시한다', () => {
    renderWithProviders(<Library />)

    expect(screen.getByText('업로드')).toBeInTheDocument()
  })
})
