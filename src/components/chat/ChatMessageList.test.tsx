import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatMessageList } from './ChatMessageList'
import type { Message } from '@/types/chat'

const messages: Message[] = [
  {
    id: '1',
    serverId: 1,
    role: 'user',
    content: '안녕하세요',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    serverId: 2,
    role: 'assistant',
    content: '반갑습니다!',
    createdAt: '2024-01-01T00:00:01Z',
  },
]

describe('ChatMessageList', () => {
  it('renders all messages', () => {
    render(<ChatMessageList messages={messages} toolCall={null} />)
    expect(screen.getByText('안녕하세요')).toBeInTheDocument()
    expect(screen.getByText('반갑습니다!')).toBeInTheDocument()
  })

  it('renders empty list', () => {
    const { container } = render(
      <ChatMessageList messages={[]} toolCall={null} />,
    )
    expect(container.querySelector('.space-y-6')).toBeInTheDocument()
  })

  it('renders tool call indicator', () => {
    render(
      <ChatMessageList
        messages={messages}
        toolCall={{ name: 'web_search', status: 'calling' }}
      />,
    )
    expect(screen.getByText('web_search 실행 중...')).toBeInTheDocument()
  })

  it('shows loading spinner when isLoading is true', () => {
    const { container } = render(
      <ChatMessageList messages={[]} toolCall={null} isLoading={true} />,
    )
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders tool messages in list', () => {
    const messagesWithTool: Message[] = [
      ...messages,
      {
        id: '3',
        serverId: 3,
        role: 'tool',
        content: '결과',
        toolName: 'web_search',
        createdAt: '2024-01-01T00:00:02Z',
      },
    ]
    render(
      <ChatMessageList messages={messagesWithTool} toolCall={null} />,
    )
    expect(screen.getByText('web_search 완료')).toBeInTheDocument()
  })
})
