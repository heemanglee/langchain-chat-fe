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
  it('renders user and assistant messages', () => {
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

  it('renders tool call indicator when streaming assistant exists', () => {
    const streamingMessages: Message[] = [
      {
        id: '1',
        serverId: 1,
        role: 'user',
        content: '검색해줘',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        serverId: null,
        role: 'assistant',
        content: '',
        isStreaming: true,
        createdAt: '2024-01-01T00:00:01Z',
      },
    ]
    render(
      <ChatMessageList
        messages={streamingMessages}
        toolCall={{ name: 'web_search', status: 'calling' }}
      />,
    )
    expect(screen.getByText('web_search 실행 중...')).toBeInTheDocument()
  })

  it('does not render tool indicator when no streaming message', () => {
    render(
      <ChatMessageList
        messages={messages}
        toolCall={{ name: 'web_search', status: 'calling' }}
      />,
    )
    expect(screen.queryByText('web_search 실행 중...')).not.toBeInTheDocument()
  })

  it('shows loading spinner when isLoading is true', () => {
    const { container } = render(
      <ChatMessageList messages={[]} toolCall={null} isLoading={true} />,
    )
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('hides tool messages from display', () => {
    const messagesWithTool: Message[] = [
      ...messages,
      {
        id: '3',
        serverId: 3,
        role: 'tool',
        content: '검색 결과',
        toolName: 'web_search',
        createdAt: '2024-01-01T00:00:02Z',
      },
    ]
    render(
      <ChatMessageList messages={messagesWithTool} toolCall={null} />,
    )
    expect(screen.queryByText('검색 결과')).not.toBeInTheDocument()
  })

  it('hides empty intermediate assistant messages', () => {
    const messagesWithIntermediate: Message[] = [
      {
        id: '1',
        serverId: 1,
        role: 'user',
        content: '검색해줘',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        serverId: 2,
        role: 'assistant',
        content: '',
        toolCalls: [{ name: 'web_search', args: {}, id: 'tc-1' }],
        createdAt: '2024-01-01T00:00:01Z',
      },
      {
        id: '3',
        serverId: 3,
        role: 'tool',
        content: '결과',
        toolName: 'web_search',
        createdAt: '2024-01-01T00:00:02Z',
      },
      {
        id: '4',
        serverId: 4,
        role: 'assistant',
        content: '날씨 정보입니다.',
        createdAt: '2024-01-01T00:00:03Z',
      },
    ]
    render(
      <ChatMessageList messages={messagesWithIntermediate} toolCall={null} />,
    )
    expect(screen.getByText('검색해줘')).toBeInTheDocument()
    expect(screen.getByText('날씨 정보입니다.')).toBeInTheDocument()
    expect(screen.getByText('web_search')).toBeInTheDocument()
  })

  it('deduplicates tools for assistant message', () => {
    const messagesWithDuplicateTools: Message[] = [
      {
        id: '1',
        serverId: 1,
        role: 'user',
        content: '질문',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        serverId: 2,
        role: 'assistant',
        content: '',
        toolCalls: [{ name: 'web_search', args: {}, id: 'tc-1' }],
        createdAt: '2024-01-01T00:00:01Z',
      },
      {
        id: '3',
        serverId: 3,
        role: 'tool',
        content: '결과1',
        toolName: 'web_search',
        createdAt: '2024-01-01T00:00:02Z',
      },
      {
        id: '4',
        serverId: 4,
        role: 'assistant',
        content: '',
        toolCalls: [{ name: 'web_search', args: {}, id: 'tc-2' }],
        createdAt: '2024-01-01T00:00:03Z',
      },
      {
        id: '5',
        serverId: 5,
        role: 'tool',
        content: '결과2',
        toolName: 'web_search',
        createdAt: '2024-01-01T00:00:04Z',
      },
      {
        id: '6',
        serverId: 6,
        role: 'assistant',
        content: '최종 응답',
        createdAt: '2024-01-01T00:00:05Z',
      },
    ]
    render(
      <ChatMessageList messages={messagesWithDuplicateTools} toolCall={null} />,
    )
    const webSearchElements = screen.getAllByText('web_search')
    expect(webSearchElements).toHaveLength(1)
  })
})
