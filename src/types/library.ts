export interface LibraryDocument {
  id: number
  original_filename: string
  content_type: string
  file_size: number
  status: 'active' | 'archived'
  summary: string | null
  summary_status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface LibraryDocumentDetail extends LibraryDocument {
  download_url: string
  preview_url: string
}

export interface LibraryDocumentListResponse {
  documents: LibraryDocument[]
  total: number
  page: number
  size: number
}

export interface StorageUsage {
  used_bytes: number
  max_bytes: number
  document_count: number
}

export interface UpdateStatusRequest {
  status: 'active' | 'archived'
}

export interface LibraryDocumentListParams {
  page?: number
  size?: number
  include_archived?: boolean
}

export interface UploadProgress {
  id: string
  filename: string
  progress: number
  status: 'uploading' | 'completed' | 'failed'
  error?: string
}
