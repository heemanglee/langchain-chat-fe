export const APP_NAME = 'RAG.OS'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8004'

export const MAX_MESSAGE_LENGTH = 4000

export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
] as const

export const FILE_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'] as const

export const MAX_TEXTAREA_ROWS = 6

export const CONVERSATION_PAGE_SIZE = 20

export const MAX_IMAGE_COUNT = 5

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024

export const LIBRARY_PAGE_SIZE = 20

export const LIBRARY_ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
] as const

export const LIBRARY_FILE_EXTENSIONS = [
  '.jpeg',
  '.jpg',
  '.png',
  '.gif',
  '.webp',
  '.pdf',
  '.txt',
  '.md',
] as const

export const LIBRARY_MAX_FILE_SIZE = 10 * 1024 * 1024

export const PREVIEWABLE_CONTENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/markdown',
] as const
