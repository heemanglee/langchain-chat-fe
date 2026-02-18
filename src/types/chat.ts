export interface Anchor {
  anchor_id: string
  page: number | null
  line_start: number | null
  line_end: number | null
  start_char: number
  end_char: number
  bbox: number[] | null
  quote: string
}

export interface WebCitation {
  citation_id: string
  source_type: 'web'
  title: string | null
  snippet: string | null
  url: string
}

export interface LibraryCitation {
  citation_id: string
  source_type: 'library'
  title: string
  snippet: string | null
  file_id: number
  file_name: string
  anchors: Anchor[]
}

export type Citation = WebCitation | LibraryCitation

export interface ChatRequest {
  message: string
  conversation_id?: string
  use_web_search?: boolean
  selected_document_ids?: number[]
  images?: File[]
}

export interface ChatResponse {
  message: string
  conversation_id: string
  session_id: number
  sources: Citation[]
  created_at: string
}

export type StreamEventType =
  | 'token'
  | 'tool_call'
  | 'tool_result'
  | 'done'
  | 'error'

export interface StreamEvent {
  event: StreamEventType
  data: string
}

export interface StreamDonePayload {
  conversation_id: string
  session_id?: number
  is_new_session?: boolean
  user_message_id?: number | null
  ai_message_id?: number | null
  image_ids?: number[]
  sources: Citation[]
}

export interface ImageSummary {
  id: number
  original_url: string
  thumbnail_url: string
  content_type: string
  original_size: number
  width: number
  height: number
  original_filename: string
}

export interface ServerMessage {
  id: number
  session_id: number
  role: 'human' | 'ai' | 'tool'
  content: string
  tool_calls_json: string | null
  tool_call_id: string | null
  tool_name: string | null
  created_at: string
  images?: ImageSummary[]
}

export interface ToolCallInfo {
  name: string
  args: Record<string, unknown>
  id: string
}

export interface Message {
  id: string
  serverId: number | null
  role: 'user' | 'assistant' | 'tool'
  content: string
  sources?: Citation[]
  isStreaming?: boolean
  createdAt: string
  toolCalls?: ToolCallInfo[]
  toolCallId?: string
  toolName?: string
  images?: ImageSummary[]
}

export interface SendMessageOptions {
  useWebSearch?: boolean
  images?: File[]
  selectedDocumentIds?: number[]
}

export interface EditMessageRequest {
  message_id: number
  conversation_id: string
  message: string
}

export interface RegenerateRequest {
  message_id: number
  conversation_id: string
}

export interface ConversationMessagesResponse {
  conversation_id: string
  messages: ServerMessage[]
}

export interface ConversationSummary {
  conversation_id: string
  title: string | null
  last_message_preview: string | null
  created_at: string
  updated_at: string
}

export interface ConversationListResponse {
  conversations: ConversationSummary[]
  next_cursor: string | null
  has_next: boolean
}
