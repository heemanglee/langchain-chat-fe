import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatMessage } from './ChatMessage'
import type { Message } from '@/types/chat'

function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: '1',
    role: 'user',
    content: '테스트 메시지',
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('ChatMessage', () => {
  it('renders user message content', () => {
    render(<ChatMessage message={createMessage()} />)
    expect(screen.getByText('테스트 메시지')).toBeInTheDocument()
  })

  it('renders assistant message with markdown', () => {
    render(
      <ChatMessage
        message={createMessage({ role: 'assistant', content: '**강조**' })}
      />,
    )
    expect(screen.getByText('강조')).toBeInTheDocument()
  })

  it('shows streaming cursor when isStreaming is true', () => {
    const { container } = render(
      <ChatMessage
        message={createMessage({
          role: 'assistant',
          content: '응답 중...',
          isStreaming: true,
        })}
      />,
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('does not show streaming cursor when isStreaming is false', () => {
    const { container } = render(
      <ChatMessage
        message={createMessage({
          role: 'assistant',
          content: '완료',
          isStreaming: false,
        })}
      />,
    )
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument()
  })

  it('renders sources when provided', () => {
    render(
      <ChatMessage
        message={createMessage({
          role: 'assistant',
          content: '답변',
          sources: ['doc1.pdf'],
        })}
      />,
    )
    expect(screen.getByText('doc1.pdf')).toBeInTheDocument()
  })

  it('shows user avatar for user messages', () => {
    const { container } = render(<ChatMessage message={createMessage()} />)
    expect(
      container.querySelector('.rounded-full.bg-zinc-200'),
    ).toBeInTheDocument()
  })

  it('shows bot avatar for assistant messages', () => {
    const { container } = render(
      <ChatMessage
        message={createMessage({ role: 'assistant', content: 'hi' })}
      />,
    )
    const avatar = container.querySelector('.rounded-full.bg-zinc-900')
    expect(avatar).toBeInTheDocument()
  })
})
