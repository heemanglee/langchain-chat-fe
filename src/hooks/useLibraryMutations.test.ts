import { renderHook, waitFor, act } from '@testing-library/react'
import { useUpdateDocumentStatus, useDeleteDocument } from './useLibraryMutations'
import { AllProviders } from '@/test/utils'

const mockUpdateDocumentStatus = vi.fn()
const mockDeleteDocument = vi.fn()

vi.mock('@/api/library', () => ({
  updateDocumentStatus: (...args: unknown[]) => mockUpdateDocumentStatus(...args),
  deleteDocument: (...args: unknown[]) => mockDeleteDocument(...args),
}))

describe('useUpdateDocumentStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('문서 상태를 변경한다', async () => {
    mockUpdateDocumentStatus.mockResolvedValue({
      status: 200,
      data: { id: 1, status: 'archived' },
    })

    const { result } = renderHook(() => useUpdateDocumentStatus(), {
      wrapper: AllProviders,
    })

    await act(async () => {
      result.current.mutate({ id: 1, data: { status: 'archived' } })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockUpdateDocumentStatus).toHaveBeenCalledWith(1, {
      status: 'archived',
    })
  })
})

describe('useDeleteDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('문서를 삭제한다', async () => {
    mockDeleteDocument.mockResolvedValue({
      status: 200,
      data: null,
    })

    const { result } = renderHook(() => useDeleteDocument(), {
      wrapper: AllProviders,
    })

    await act(async () => {
      result.current.mutate(1)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockDeleteDocument).toHaveBeenCalledWith(1)
  })
})
