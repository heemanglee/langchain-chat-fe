export interface ApiResponse<T> {
  status: number
  message: string
  data: T | null
}

export interface ApiError {
  status: number
  message: string
  code?: string
}

export interface ValidationErrorDetail {
  loc: (string | number)[]
  msg: string
  type: string
  input?: unknown
  ctx?: Record<string, unknown>
}

export interface HTTPValidationError {
  detail: ValidationErrorDetail[]
}
