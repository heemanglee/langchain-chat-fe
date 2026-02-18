import { apiClient } from './client'
import { API_BASE_URL } from '@/lib/constants'
import type { ApiResponse } from '@/types/api'
import type {
  LibraryDocument,
  LibraryDocumentDetail,
  LibraryDocumentListResponse,
  LibraryDocumentListParams,
  StorageUsage,
  UpdateStatusRequest,
} from '@/types/library'

export function fetchDocuments(
  params?: LibraryDocumentListParams,
): Promise<ApiResponse<LibraryDocumentListResponse>> {
  const searchParams: Record<string, string> = {}
  if (params?.page !== undefined) searchParams.page = String(params.page)
  if (params?.size !== undefined) searchParams.size = String(params.size)
  if (params?.include_archived !== undefined)
    searchParams.include_archived = String(params.include_archived)

  return apiClient
    .get('api/v1/library/documents', { searchParams })
    .json()
}

export function fetchDocumentDetail(
  id: number,
): Promise<ApiResponse<LibraryDocumentDetail>> {
  return apiClient.get(`api/v1/library/documents/${id}`).json()
}

export function updateDocumentStatus(
  id: number,
  data: UpdateStatusRequest,
): Promise<ApiResponse<LibraryDocument>> {
  return apiClient
    .patch(`api/v1/library/documents/${id}/status`, { json: data })
    .json()
}

export function deleteDocument(id: number): Promise<ApiResponse<null>> {
  return apiClient.delete(`api/v1/library/documents/${id}`).json()
}

export function fetchStorageUsage(): Promise<ApiResponse<StorageUsage>> {
  return apiClient.get('api/v1/library/storage').json()
}

export function uploadDocument(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<ApiResponse<LibraryDocument>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    })

    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText) as ApiResponse<LibraryDocument>
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response)
        } else {
          reject(response)
        }
      } catch {
        reject(new Error('Failed to parse response'))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    xhr.open('POST', `${API_BASE_URL}/api/v1/library/documents`)

    const token = localStorage.getItem('access_token')
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    xhr.send(formData)
  })
}

export function getDocumentDownloadUrl(id: number): string {
  return `${API_BASE_URL}/api/v1/library/documents/${id}/download`
}

export function getDocumentPreviewUrl(id: number): string {
  return `${API_BASE_URL}/api/v1/library/documents/${id}/preview`
}
