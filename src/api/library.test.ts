import {
  fetchDocuments,
  fetchDocumentDetail,
  updateDocumentStatus,
  deleteDocument,
  fetchStorageUsage,
  uploadDocument,
} from './library'

const mockJson = vi.fn()
const mockGet = vi.fn(() => ({ json: mockJson }))
const mockPatch = vi.fn(() => ({ json: mockJson }))
const mockDelete = vi.fn(() => ({ json: mockJson }))

vi.mock('./client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...(args as [])),
    patch: (...args: unknown[]) => mockPatch(...(args as [])),
    delete: (...args: unknown[]) => mockDelete(...(args as [])),
  },
}))

describe('library API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchDocuments', () => {
    it('파라미터 없이 문서 목록을 조회한다', async () => {
      const response = { status: 200, message: 'ok', data: { documents: [], total: 0, page: 1, size: 20 } }
      mockJson.mockResolvedValue(response)

      const result = await fetchDocuments()

      expect(mockGet).toHaveBeenCalledWith('api/v1/library/documents', { searchParams: {} })
      expect(result).toEqual(response)
    })

    it('페이지네이션 파라미터를 전달한다', async () => {
      mockJson.mockResolvedValue({ status: 200, data: null })

      await fetchDocuments({ page: 2, size: 10, include_archived: true })

      expect(mockGet).toHaveBeenCalledWith('api/v1/library/documents', {
        searchParams: { page: '2', size: '10', include_archived: 'true' },
      })
    })
  })

  describe('fetchDocumentDetail', () => {
    it('문서 상세 정보를 조회한다', async () => {
      const response = { status: 200, message: 'ok', data: { id: 1 } }
      mockJson.mockResolvedValue(response)

      const result = await fetchDocumentDetail(1)

      expect(mockGet).toHaveBeenCalledWith('api/v1/library/documents/1')
      expect(result).toEqual(response)
    })
  })

  describe('updateDocumentStatus', () => {
    it('문서 상태를 변경한다', async () => {
      const response = { status: 200, message: 'ok', data: { id: 1, status: 'archived' } }
      mockJson.mockResolvedValue(response)

      const result = await updateDocumentStatus(1, { status: 'archived' })

      expect(mockPatch).toHaveBeenCalledWith('api/v1/library/documents/1/status', {
        json: { status: 'archived' },
      })
      expect(result).toEqual(response)
    })
  })

  describe('deleteDocument', () => {
    it('문서를 삭제한다', async () => {
      const response = { status: 200, message: 'ok', data: null }
      mockJson.mockResolvedValue(response)

      const result = await deleteDocument(1)

      expect(mockDelete).toHaveBeenCalledWith('api/v1/library/documents/1')
      expect(result).toEqual(response)
    })
  })

  describe('fetchStorageUsage', () => {
    it('스토리지 사용량을 조회한다', async () => {
      const response = {
        status: 200,
        message: 'ok',
        data: { used_bytes: 1024, max_bytes: 104857600, document_count: 5 },
      }
      mockJson.mockResolvedValue(response)

      const result = await fetchStorageUsage()

      expect(mockGet).toHaveBeenCalledWith('api/v1/library/storage')
      expect(result).toEqual(response)
    })
  })

  describe('uploadDocument', () => {
    let mockXhr: {
      open: ReturnType<typeof vi.fn>
      send: ReturnType<typeof vi.fn>
      setRequestHeader: ReturnType<typeof vi.fn>
      upload: { addEventListener: ReturnType<typeof vi.fn> }
      addEventListener: ReturnType<typeof vi.fn>
      status: number
      responseText: string
    }

    const originalXHR = globalThis.XMLHttpRequest
    let mockStorage: Record<string, string>

    beforeEach(() => {
      mockXhr = {
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        upload: { addEventListener: vi.fn() },
        addEventListener: vi.fn(),
        status: 200,
        responseText: '',
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MockXHR = function (this: any) {
        this.open = mockXhr.open
        this.send = mockXhr.send
        this.setRequestHeader = mockXhr.setRequestHeader
        this.upload = mockXhr.upload
        this.addEventListener = mockXhr.addEventListener
        // Use getters so mutations are visible
        Object.defineProperty(this, 'status', { get: () => mockXhr.status })
        Object.defineProperty(this, 'responseText', { get: () => mockXhr.responseText })
      } as unknown as typeof XMLHttpRequest
      vi.stubGlobal('XMLHttpRequest', MockXHR)

      mockStorage = {}
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key: string) => mockStorage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value }),
        removeItem: vi.fn((key: string) => { delete mockStorage[key] }),
        clear: vi.fn(() => { mockStorage = {} }),
      })
    })

    afterEach(() => {
      vi.stubGlobal('XMLHttpRequest', originalXHR)
    })

    it('파일을 업로드하고 성공 응답을 반환한다', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const response = { status: 201, message: 'ok', data: { id: 1 } }

      mockXhr.addEventListener.mockImplementation((event: string, handler: () => void) => {
        if (event === 'load') {
          mockXhr.status = 201
          mockXhr.responseText = JSON.stringify(response)
          setTimeout(handler, 0)
        }
      })

      const result = await uploadDocument(file)

      expect(mockXhr.open).toHaveBeenCalledWith(
        'POST',
        expect.stringContaining('/api/v1/library/documents'),
      )
      expect(result).toEqual(response)
    })

    it('업로드 진행률 콜백을 호출한다', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const onProgress = vi.fn()

      mockXhr.upload.addEventListener.mockImplementation(
        (event: string, handler: (e: { lengthComputable: boolean; loaded: number; total: number }) => void) => {
          if (event === 'progress') {
            handler({ lengthComputable: true, loaded: 50, total: 100 })
          }
        },
      )

      mockXhr.addEventListener.mockImplementation(() => {})

      uploadDocument(file, onProgress)

      expect(onProgress).toHaveBeenCalledWith(50)
    })

    it('JWT 토큰을 Authorization 헤더에 설정한다', () => {
      mockStorage['access_token'] = 'test-token'
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      mockXhr.addEventListener.mockImplementation(() => {})

      uploadDocument(file)

      expect(mockXhr.setRequestHeader).toHaveBeenCalledWith(
        'Authorization',
        'Bearer test-token',
      )
    })
  })
})
