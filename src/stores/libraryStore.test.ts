import { useLibraryStore } from './libraryStore'
import type { UploadProgress } from '@/types/library'

const mockUpload: UploadProgress = {
  id: 'upload-1',
  filename: 'test.pdf',
  progress: 0,
  status: 'uploading',
}

describe('libraryStore', () => {
  beforeEach(() => {
    useLibraryStore.setState({
      includeArchived: false,
      uploads: [],
    })
  })

  it('초기 상태가 올바르다', () => {
    const state = useLibraryStore.getState()
    expect(state.includeArchived).toBe(false)
    expect(state.uploads).toEqual([])
  })

  describe('includeArchived', () => {
    it('toggleArchived가 상태를 토글한다', () => {
      useLibraryStore.getState().toggleArchived()
      expect(useLibraryStore.getState().includeArchived).toBe(true)

      useLibraryStore.getState().toggleArchived()
      expect(useLibraryStore.getState().includeArchived).toBe(false)
    })

    it('setIncludeArchived가 값을 직접 설정한다', () => {
      useLibraryStore.getState().setIncludeArchived(true)
      expect(useLibraryStore.getState().includeArchived).toBe(true)

      useLibraryStore.getState().setIncludeArchived(false)
      expect(useLibraryStore.getState().includeArchived).toBe(false)
    })
  })

  describe('uploads', () => {
    it('addUpload이 업로드를 추가한다', () => {
      useLibraryStore.getState().addUpload(mockUpload)
      expect(useLibraryStore.getState().uploads).toHaveLength(1)
      expect(useLibraryStore.getState().uploads[0]).toEqual(mockUpload)
    })

    it('updateUpload이 특정 업로드를 갱신한다', () => {
      useLibraryStore.getState().addUpload(mockUpload)
      useLibraryStore.getState().updateUpload('upload-1', { progress: 50 })

      const upload = useLibraryStore.getState().uploads[0]
      expect(upload.progress).toBe(50)
      expect(upload.filename).toBe('test.pdf')
    })

    it('updateUpload이 존재하지 않는 id를 무시한다', () => {
      useLibraryStore.getState().addUpload(mockUpload)
      useLibraryStore.getState().updateUpload('nonexistent', { progress: 99 })

      expect(useLibraryStore.getState().uploads[0].progress).toBe(0)
    })

    it('removeUpload이 특정 업로드를 제거한다', () => {
      useLibraryStore.getState().addUpload(mockUpload)
      useLibraryStore.getState().addUpload({
        ...mockUpload,
        id: 'upload-2',
        filename: 'other.pdf',
      })

      useLibraryStore.getState().removeUpload('upload-1')
      expect(useLibraryStore.getState().uploads).toHaveLength(1)
      expect(useLibraryStore.getState().uploads[0].id).toBe('upload-2')
    })

    it('clearCompletedUploads가 완료된 업로드만 제거한다', () => {
      useLibraryStore.getState().addUpload(mockUpload)
      useLibraryStore.getState().addUpload({
        id: 'upload-2',
        filename: 'done.pdf',
        progress: 100,
        status: 'completed',
      })
      useLibraryStore.getState().addUpload({
        id: 'upload-3',
        filename: 'fail.pdf',
        progress: 30,
        status: 'failed',
      })

      useLibraryStore.getState().clearCompletedUploads()

      const uploads = useLibraryStore.getState().uploads
      expect(uploads).toHaveLength(2)
      expect(uploads.map((u) => u.id)).toEqual(['upload-1', 'upload-3'])
    })
  })
})
