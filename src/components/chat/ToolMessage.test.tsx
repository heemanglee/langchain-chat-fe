import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToolMessage } from './ToolMessage'
import type { Message } from '@/types/chat'

function createToolMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: '1',
    serverId: 1,
    role: 'tool',
    content: '{"result": "data"}',
    toolName: 'web_search',
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('ToolMessage', () => {
  it('renders tool name with completion text', () => {
    render(<ToolMessage message={createToolMessage()} />)
    expect(screen.getByText('web_search 완료')).toBeInTheDocument()
  })

  it('shows default tool name when toolName is missing', () => {
    render(
      <ToolMessage message={createToolMessage({ toolName: undefined })} />,
    )
    expect(screen.getByText('tool 완료')).toBeInTheDocument()
  })

  it('has check icon element', () => {
    const { container } = render(
      <ToolMessage message={createToolMessage()} />,
    )
    const indicator = container.querySelector('.rounded-lg')
    expect(indicator).toBeInTheDocument()
  })
})
