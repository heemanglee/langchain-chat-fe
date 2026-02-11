import { describe, it, expect } from 'vitest'
import { mapServerMessage, mapRole, parseToolCalls, mapImages } from './messageMapper'
import type { ImageSummary, ServerMessage } from '@/types/chat'

describe('mapRole', () => {
  it('maps human to user', () => {
    expect(mapRole('human')).toBe('user')
  })

  it('maps ai to assistant', () => {
    expect(mapRole('ai')).toBe('assistant')
  })

  it('maps tool to tool', () => {
    expect(mapRole('tool')).toBe('tool')
  })

  it('defaults to assistant for unknown roles', () => {
    expect(mapRole('unknown')).toBe('assistant')
  })
})

describe('parseToolCalls', () => {
  it('returns undefined for null input', () => {
    expect(parseToolCalls(null)).toBeUndefined()
  })

  it('returns undefined for invalid JSON', () => {
    expect(parseToolCalls('not json')).toBeUndefined()
  })

  it('returns undefined for non-array JSON', () => {
    expect(parseToolCalls('{"name":"test"}')).toBeUndefined()
  })

  it('parses valid tool calls JSON', () => {
    const json = JSON.stringify([
      { name: 'web_search', args: { query: 'test' }, id: 'tc-1' },
    ])
    const result = parseToolCalls(json)
    expect(result).toEqual([
      { name: 'web_search', args: { query: 'test' }, id: 'tc-1' },
    ])
  })

  it('provides defaults for missing fields', () => {
    const json = JSON.stringify([{}])
    const result = parseToolCalls(json)
    expect(result).toEqual([{ name: 'unknown', args: {}, id: '' }])
  })
})

describe('mapImages', () => {
  const sampleImage: ImageSummary = {
    id: 1,
    original_url: 'https://s3.example.com/original.jpg',
    thumbnail_url: 'https://s3.example.com/thumb.jpg',
    content_type: 'image/jpeg',
    original_size: 204800,
    width: 1920,
    height: 1080,
    original_filename: 'photo.jpg',
  }

  it('returns undefined for undefined input', () => {
    expect(mapImages(undefined)).toBeUndefined()
  })

  it('returns undefined for empty array', () => {
    expect(mapImages([])).toBeUndefined()
  })

  it('returns images array when non-empty', () => {
    const result = mapImages([sampleImage])
    expect(result).toEqual([sampleImage])
  })
})

describe('mapServerMessage', () => {
  const base: ServerMessage = {
    id: 42,
    session_id: 1,
    role: 'human',
    content: 'Hello',
    tool_calls_json: null,
    tool_call_id: null,
    tool_name: null,
    created_at: '2024-01-01T00:00:00Z',
  }

  it('maps human message correctly', () => {
    const result = mapServerMessage(base)
    expect(result).toEqual({
      id: '42',
      serverId: 42,
      role: 'user',
      content: 'Hello',
      createdAt: '2024-01-01T00:00:00Z',
      toolCalls: undefined,
      toolCallId: undefined,
      toolName: undefined,
      images: undefined,
    })
  })

  it('maps message with images', () => {
    const images: ImageSummary[] = [
      {
        id: 1,
        original_url: 'https://s3.example.com/original.jpg',
        thumbnail_url: 'https://s3.example.com/thumb.jpg',
        content_type: 'image/jpeg',
        original_size: 204800,
        width: 1920,
        height: 1080,
        original_filename: 'photo.jpg',
      },
    ]
    const msg: ServerMessage = { ...base, images }
    const result = mapServerMessage(msg)
    expect(result.images).toEqual(images)
  })

  it('maps message with empty images to undefined', () => {
    const msg: ServerMessage = { ...base, images: [] }
    const result = mapServerMessage(msg)
    expect(result.images).toBeUndefined()
  })

  it('maps ai message with tool calls', () => {
    const msg: ServerMessage = {
      ...base,
      role: 'ai',
      content: 'Using search',
      tool_calls_json: JSON.stringify([
        { name: 'search', args: {}, id: 'tc-1' },
      ]),
    }
    const result = mapServerMessage(msg)
    expect(result.role).toBe('assistant')
    expect(result.toolCalls).toHaveLength(1)
    expect(result.toolCalls![0].name).toBe('search')
  })

  it('maps tool message', () => {
    const msg: ServerMessage = {
      ...base,
      role: 'tool',
      content: '{"result": "found"}',
      tool_call_id: 'tc-1',
      tool_name: 'web_search',
    }
    const result = mapServerMessage(msg)
    expect(result.role).toBe('tool')
    expect(result.toolCallId).toBe('tc-1')
    expect(result.toolName).toBe('web_search')
  })
})
