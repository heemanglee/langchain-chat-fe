import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssistantMessage } from './AssistantMessage'
import type { Citation, Message } from '@/types/chat'

const testCitations: Citation[] = [
  {
    citation_id: 'lib-1',
    source_type: 'library',
    title: 'doc.pdf',
    snippet: null,
    file_id: 1,
    file_name: 'doc.pdf',
    anchors: [
      {
        anchor_id: 'a-1',
        page: 1,
        line_start: null,
        line_end: null,
        start_char: 0,
        end_char: 10,
        bbox: null,
        quote: '본문 인용',
      },
    ],
  },
]

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
        message={createAssistantMessage({ sources: testCitations })}
      />,
    )
    expect(screen.getByText('doc.pdf')).toBeInTheDocument()
  })

  it('renders used tools summary', () => {
    render(
      <AssistantMessage
        message={createAssistantMessage()}
        usedTools={['web_search']}
      />,
    )
    expect(screen.getByText('web_search')).toBeInTheDocument()
  })

  it('renders multiple used tools', () => {
    render(
      <AssistantMessage
        message={createAssistantMessage()}
        usedTools={['web_search', 'document_retrieval']}
      />,
    )
    expect(screen.getByText('web_search')).toBeInTheDocument()
    expect(screen.getByText('document_retrieval')).toBeInTheDocument()
  })

  it('hides tool summary when streaming', () => {
    render(
      <AssistantMessage
        message={createAssistantMessage({ isStreaming: true })}
        usedTools={['web_search']}
      />,
    )
    expect(screen.queryByText('web_search')).not.toBeInTheDocument()
  })

  it('hides tool summary when no tools used', () => {
    const { container } = render(
      <AssistantMessage message={createAssistantMessage()} usedTools={[]} />,
    )
    expect(container.querySelectorAll('.rounded-full.bg-zinc-100')).toHaveLength(0)
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

  it('opens library citation panel when inline citation is clicked', async () => {
    const user = userEvent.setup()
    const onOpenLibraryCitation = vi.fn()

    render(
      <AssistantMessage
        message={createAssistantMessage({
          content: '요약 결과입니다. [cite:1]',
          sources: testCitations,
        })}
        onOpenLibraryCitation={onOpenLibraryCitation}
      />,
    )

    await user.click(screen.getByRole('button', { name: '출처 1' }))
    expect(onOpenLibraryCitation).toHaveBeenCalledWith(
      testCitations[0],
      'a-1',
    )
  })

  it('matches citation by number suffix when id format differs', async () => {
    const user = userEvent.setup()
    const onOpenLibraryCitation = vi.fn()

    render(
      <AssistantMessage
        message={createAssistantMessage({
          content: '요약 결과입니다. [cite:1]',
          sources: [
            {
              ...testCitations[0],
              citation_id: 'citation-1',
            },
          ],
        })}
        onOpenLibraryCitation={onOpenLibraryCitation}
      />,
    )

    await user.click(screen.getByRole('button', { name: '출처 1' }))
    expect(onOpenLibraryCitation).toHaveBeenCalled()
  })

  it('opens citation when localized marker is used', async () => {
    const user = userEvent.setup()
    const onOpenLibraryCitation = vi.fn()

    render(
      <AssistantMessage
        message={createAssistantMessage({
          content: '요약 결과입니다. [시민투입:1]',
          sources: testCitations,
        })}
        onOpenLibraryCitation={onOpenLibraryCitation}
      />,
    )

    await user.click(screen.getByRole('button', { name: '출처 1' }))
    expect(onOpenLibraryCitation).toHaveBeenCalledWith(
      testCitations[0],
      'a-1',
    )
  })
})
