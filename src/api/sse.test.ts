import { describe, it, expect, vi, beforeEach } from 'vitest'
import { streamSSE } from './sse'

describe('streamSSE', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.setItem('access_token', 'test-token')
  })

  it('calls handlers for SSE events', async () => {
    const handlers = {
      onToken: vi.fn(),
      onToolCall: vi.fn(),
      onToolResult: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    }

    const encoder = new TextEncoder()
    const sseData = [
      'data: {"event":"token","data":"Hello"}\n\n',
      'data: {"event":"tool_call","data":{"name":"search"}}\n\n',
      'data: {"event":"tool_result","data":{"result":"found"}}\n\n',
      'data: {"event":"done","data":{"conversation_id":"c1","sources":["s1"]}}\n\n',
    ].join('')

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseData))
        controller.close()
      },
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream, { status: 200 }),
    )

    await streamSSE('/api/v1/chat/stream', { message: 'test' }, handlers)

    expect(handlers.onToken).toHaveBeenCalledWith('Hello')
    expect(handlers.onToolCall).toHaveBeenCalledWith({ name: 'search' })
    expect(handlers.onToolResult).toHaveBeenCalledWith({ result: 'found' })
    expect(handlers.onDone).toHaveBeenCalledWith({
      conversation_id: 'c1',
      sources: ['s1'],
    })
  })

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 500 }),
    )

    const handlers = {
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    }

    await expect(
      streamSSE('/api/v1/chat/stream', { message: 'test' }, handlers),
    ).rejects.toThrow('Stream request failed: 500')
  })

  it('skips malformed SSE lines', async () => {
    const encoder = new TextEncoder()
    const sseData =
      'data: not json\ndata: {"event":"token","data":"ok"}\n\n'

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseData))
        controller.close()
      },
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream, { status: 200 }),
    )

    const handlers = {
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    }

    await streamSSE('/api/v1/chat/stream', { message: 'test' }, handlers)

    expect(handlers.onToken).toHaveBeenCalledWith('ok')
  })

  it('sends Authorization header when token exists', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(new ReadableStream({ start(c) { c.close() } }), { status: 200 }),
    )

    const handlers = {
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    }

    await streamSSE('/api/v1/chat/stream', {}, handlers)

    const callArgs = fetchSpy.mock.calls[0]
    const init = callArgs[1] as RequestInit
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer test-token',
    )
  })

  it('handles error event', async () => {
    const encoder = new TextEncoder()
    const sseData = 'data: {"event":"error","data":"서버 오류"}\n\n'

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseData))
        controller.close()
      },
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream, { status: 200 }),
    )

    const handlers = {
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    }

    await streamSSE('/api/v1/chat/stream', {}, handlers)

    expect(handlers.onError).toHaveBeenCalledWith('서버 오류')
  })
})
