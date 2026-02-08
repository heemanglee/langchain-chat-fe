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
