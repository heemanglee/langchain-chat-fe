import { renderHook, waitFor, act } from '@testing-library/react'
import { useUploadDocument } from './useUploadDocument'
import { useLibraryStore } from '@/stores/libraryStore'
import { AllProviders } from '@/test/utils'

const mockUploadDocument = vi.fn()

vi.mock('@/api/library', () => ({
  uploadDocument: (...args: unknown[]) => mockUploadDocument(...args),
}))

describe('useUploadDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useLibraryStore.setState({ uploads: [] })
  })

  it('업로드 성공 시 스토어에 업로드를 추가하고 completed로 갱신한다', async () => {
    mockUploadDocument.mockResolvedValue({
      status: 201,
      data: { id: 1, original_filename: 'test.pdf' },
    })

    const { result } = renderHook(() => useUploadDocument(), {
      wrapper: AllProviders,
    })

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    await act(async () => {
      result.current.mutate(file)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const uploads = useLibraryStore.getState().uploads
    expect(uploads).toHaveLength(1)
    expect(uploads[0].status).toBe('completed')
    expect(uploads[0].progress).toBe(100)
  })

  it('업로드 실패 시 스토어에 failed 상태를 설정한다', async () => {
    mockUploadDocument.mockRejectedValue(new Error('Upload failed'))

    const { result } = renderHook(() => useUploadDocument(), {
      wrapper: AllProviders,
    })

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    await act(async () => {
      result.current.mutate(file)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const uploads = useLibraryStore.getState().uploads
    expect(uploads).toHaveLength(1)
    expect(uploads[0].status).toBe('failed')
    expect(uploads[0].error).toBe('Upload failed')
  })
})
