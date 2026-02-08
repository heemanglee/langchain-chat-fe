import type { ServerMessage, Message, ToolCallInfo } from '@/types/chat'

function mapRole(backendRole: string): 'user' | 'assistant' | 'tool' {
  switch (backendRole) {
    case 'human':
      return 'user'
    case 'ai':
      return 'assistant'
    case 'tool':
      return 'tool'
    default:
      return 'assistant'
  }
}

function parseToolCalls(json: string | null): ToolCallInfo[] | undefined {
  if (!json) return undefined
  try {
    const parsed = JSON.parse(json) as unknown
    if (!Array.isArray(parsed)) return undefined
    return parsed.map((tc: { name?: string; args?: Record<string, unknown>; id?: string }) => ({
      name: tc.name ?? 'unknown',
      args: tc.args ?? {},
      id: tc.id ?? '',
    }))
  } catch {
    return undefined
  }
}

function mapServerMessage(raw: ServerMessage): Message {
  return {
    id: String(raw.id),
    serverId: raw.id,
    role: mapRole(raw.role),
    content: raw.content,
    createdAt: raw.created_at,
    toolCalls: parseToolCalls(raw.tool_calls_json),
    toolCallId: raw.tool_call_id ?? undefined,
    toolName: raw.tool_name ?? undefined,
  }
}

export { mapServerMessage, mapRole, parseToolCalls }
