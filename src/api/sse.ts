import type { StreamDonePayload } from '@/types/chat'

export interface StreamHandlers {
  onToken: (token: string) => void
  onToolCall?: (data: unknown) => void
  onToolResult?: (data: unknown) => void
  onDone: (data: StreamDonePayload) => void
  onError: (error: string) => void
}

function parseDonePayload(raw: unknown): StreamDonePayload {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as StreamDonePayload
    } catch {
      return { conversation_id: '', sources: [] }
    }
  }

  if (raw && typeof raw === 'object') {
    return raw as StreamDonePayload
  }

  return { conversation_id: '', sources: [] }
}

function processSSELine(line: string, handlers: StreamHandlers): void {
  const trimmed = line.trim()
  if (!trimmed || !trimmed.startsWith('data: ')) return

  const parsed = JSON.parse(trimmed.slice(6)) as {
    event: string
    data: unknown
  }

  switch (parsed.event) {
    case 'token':
      handlers.onToken(parsed.data as string)
      break
    case 'tool_call':
      handlers.onToolCall?.(parsed.data)
      break
    case 'tool_result':
      handlers.onToolResult?.(parsed.data)
      break
    case 'done':
      handlers.onDone(parseDonePayload(parsed.data))
      break
    case 'error':
      handlers.onError(parsed.data as string)
      break
  }
}

async function readSSEStream(
  response: Response,
  handlers: StreamHandlers,
): Promise<void> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      try {
        processSSELine(line, handlers)
      } catch {
        // skip malformed SSE lines
      }
    }
  }
}

export async function streamSSE(
  url: string,
  body: unknown,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const token = localStorage.getItem('access_token')
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8004'

  const response = await fetch(`${baseUrl}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status}`)
  }

  await readSSEStream(response, handlers)
}

export async function streamSSEWithFormData(
  url: string,
  formData: FormData,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const token = localStorage.getItem('access_token')
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8004'

  const response = await fetch(`${baseUrl}${url}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    signal,
  })

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.status}`)
  }

  await readSSEStream(response, handlers)
}
