import { describe, it, expect, vi, beforeEach } from 'vitest'
import { streamSSE, streamSSEWithFormData } from './sse'

function setupMockLocalStorage() {
  const store: Record<string, string> = {}
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      for (const key of Object.keys(store)) {
        delete store[key]
      }
    }),
  })
}

describe('streamSSE', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setupMockLocalStorage()
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
      'data: {"event":"done","data":{"conversation_id":"c1","sources":[{"citation_id":"web-1","source_type":"web","title":"검색","snippet":null,"url":"https://example.com"}]}}\n\n',
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
      sources: [
        {
          citation_id: 'web-1',
          source_type: 'web',
          title: '검색',
          snippet: null,
          url: 'https://example.com',
        },
      ],
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

describe('streamSSEWithFormData', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setupMockLocalStorage()
    localStorage.setItem('access_token', 'test-token')
  })

  it('sends FormData without Content-Type header', async () => {
    const encoder = new TextEncoder()
    const sseData =
      'data: {"event":"done","data":{"conversation_id":"c1","sources":[]}}\n\n'

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseData))
        controller.close()
      },
    })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(stream, { status: 200 }),
    )

    const handlers = {
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    }

    const formData = new FormData()
    formData.append('message', 'hello')

    await streamSSEWithFormData('/api/v1/chat/stream', formData, handlers)

    const callArgs = fetchSpy.mock.calls[0]
    const init = callArgs[1] as RequestInit
    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
    expect(headers.Authorization).toBe('Bearer test-token')
    expect(init.body).toBe(formData)
    expect(handlers.onDone).toHaveBeenCalledWith({
      conversation_id: 'c1',
      sources: [],
    })
  })

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 413 }),
    )

    const handlers = {
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    }

    await expect(
      streamSSEWithFormData(
        '/api/v1/chat/stream',
        new FormData(),
        handlers,
      ),
    ).rejects.toThrow('Stream request failed: 413')
  })

  it('processes SSE events from FormData response', async () => {
    const encoder = new TextEncoder()
    const sseData = [
      'data: {"event":"token","data":"Hi"}\n\n',
      'data: {"event":"done","data":{"conversation_id":"c2","sources":[{"citation_id":"lib-1","source_type":"library","title":"문서","snippet":null,"file_id":1,"file_name":"doc.pdf","anchors":[]}]}}\n\n',
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

    const handlers = {
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    }

    await streamSSEWithFormData('/api/v1/chat/stream', new FormData(), handlers)

    expect(handlers.onToken).toHaveBeenCalledWith('Hi')
    expect(handlers.onDone).toHaveBeenCalledWith({
      conversation_id: 'c2',
      sources: [
        {
          citation_id: 'lib-1',
          source_type: 'library',
          title: '문서',
          snippet: null,
          file_id: 1,
          file_name: 'doc.pdf',
          anchors: [],
        },
      ],
    })
  })

  it('parses done payload when data is JSON string', async () => {
    const encoder = new TextEncoder()
    const sseData =
      'data: {"event":"done","data":"{\\"conversation_id\\":\\"c3\\",\\"sources\\":[{\\"citation_id\\":\\"lib-3\\",\\"source_type\\":\\"library\\",\\"title\\":\\"문서\\",\\"snippet\\":null,\\"file_id\\":15,\\"file_name\\":\\"doc.pdf\\",\\"anchors\\":[]}]}"}\n\n'

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

    await streamSSEWithFormData('/api/v1/chat/stream', new FormData(), handlers)

    expect(handlers.onDone).toHaveBeenCalledWith({
      conversation_id: 'c3',
      sources: [
        {
          citation_id: 'lib-3',
          source_type: 'library',
          title: '문서',
          snippet: null,
          file_id: 15,
          file_name: 'doc.pdf',
          anchors: [],
        },
      ],
    })
  })
})
