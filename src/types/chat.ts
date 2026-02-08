export interface ChatRequest {
  message: string
  conversation_id?: string
  use_web_search?: boolean
}

export interface ChatResponse {
  message: string
  conversation_id: string
  session_id: number
  sources: string[]
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

export interface ServerMessage {
  id: number
  session_id: number
  role: 'human' | 'ai' | 'tool'
  content: string
  tool_calls_json: string | null
  tool_call_id: string | null
  tool_name: string | null
  created_at: string
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
  sources?: string[]
  isStreaming?: boolean
  createdAt: string
  toolCalls?: ToolCallInfo[]
  toolCallId?: string
  toolName?: string
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
