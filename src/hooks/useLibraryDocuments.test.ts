import { renderHook, waitFor } from '@testing-library/react'
import { useLibraryDocuments, useStorageUsage } from './useLibraryDocuments'
import { useLibraryStore } from '@/stores/libraryStore'
import { AllProviders } from '@/test/utils'

vi.mock('@/api/library', () => ({
  fetchDocuments: vi.fn().mockResolvedValue({
    status: 200,
    message: 'ok',
    data: {
      documents: [
        { id: 1, original_filename: 'test.pdf', status: 'active' },
        { id: 2, original_filename: 'doc.txt', status: 'archived' },
      ],
      total: 2,
      page: 1,
      size: 20,
    },
  }),
  fetchStorageUsage: vi.fn().mockResolvedValue({
    status: 200,
    message: 'ok',
    data: { used_bytes: 5242880, max_bytes: 104857600, document_count: 2 },
  }),
}))

describe('useLibraryDocuments', () => {
  beforeEach(() => {
    useLibraryStore.setState({ includeArchived: false })
  })

  it('문서 목록을 조회하고 totalPages를 계산한다', async () => {
    const { result } = renderHook(() => useLibraryDocuments(1), {
      wrapper: AllProviders,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.documents).toHaveLength(2)
    expect(result.current.data?.total).toBe(2)
    expect(result.current.data?.totalPages).toBe(1)
  })
})

describe('useStorageUsage', () => {
  it('스토리지 사용량을 조회한다', async () => {
    const { result } = renderHook(() => useStorageUsage(), {
      wrapper: AllProviders,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.used_bytes).toBe(5242880)
    expect(result.current.data?.max_bytes).toBe(104857600)
    expect(result.current.data?.document_count).toBe(2)
  })
})
