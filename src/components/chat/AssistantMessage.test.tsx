import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AssistantMessage } from './AssistantMessage'
import type { Message } from '@/types/chat'

function createAssistantMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: '1',
    serverId: 11,
    role: 'assistant',
    content: 'AI 응답입니다',
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('AssistantMessage', () => {
  it('renders assistant message content', () => {
    render(<AssistantMessage message={createAssistantMessage()} />)
    expect(screen.getByText('AI 응답입니다')).toBeInTheDocument()
  })

  it('shows streaming cursor when isStreaming', () => {
    const { container } = render(
      <AssistantMessage
        message={createAssistantMessage({ isStreaming: true })}
      />,
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders sources', () => {
    render(
      <AssistantMessage
        message={createAssistantMessage({ sources: ['doc.pdf'] })}
      />,
    )
    expect(screen.getByText('doc.pdf')).toBeInTheDocument()
  })

  it('renders tool call badges', () => {
    render(
      <AssistantMessage
        message={createAssistantMessage({
          toolCalls: [{ name: 'web_search', args: {}, id: 'tc-1' }],
        })}
      />,
    )
    expect(screen.getByText('web_search')).toBeInTheDocument()
  })

  it('shows regenerate button for last assistant with serverId', () => {
    render(
      <AssistantMessage
        message={createAssistantMessage()}
        isLastAssistant={true}
        onRegenerate={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('응답 재생성')).toBeInTheDocument()
  })

  it('hides regenerate button when not last assistant', () => {
    render(
      <AssistantMessage
        message={createAssistantMessage()}
        isLastAssistant={false}
        onRegenerate={vi.fn()}
      />,
    )
    expect(screen.queryByLabelText('응답 재생성')).not.toBeInTheDocument()
  })

  it('hides regenerate button when streaming', () => {
    render(
      <AssistantMessage
        message={createAssistantMessage({ isStreaming: true })}
        isLastAssistant={true}
        onRegenerate={vi.fn()}
      />,
    )
    expect(screen.queryByLabelText('응답 재생성')).not.toBeInTheDocument()
  })

  it('hides regenerate button when serverId is null', () => {
    render(
      <AssistantMessage
        message={createAssistantMessage({ serverId: null })}
        isLastAssistant={true}
        onRegenerate={vi.fn()}
      />,
    )
    expect(screen.queryByLabelText('응답 재생성')).not.toBeInTheDocument()
  })

  it('shows bot avatar', () => {
    const { container } = render(
      <AssistantMessage message={createAssistantMessage()} />,
    )
    expect(
      container.querySelector('.rounded-full.bg-zinc-900'),
    ).toBeInTheDocument()
  })
})
