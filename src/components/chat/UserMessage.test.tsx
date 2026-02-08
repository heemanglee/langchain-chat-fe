import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMessage } from './UserMessage'
import type { Message } from '@/types/chat'

function createUserMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: '1',
    serverId: 10,
    role: 'user',
    content: '테스트 메시지',
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('UserMessage', () => {
  it('renders user message content', () => {
    render(<UserMessage message={createUserMessage()} />)
    expect(screen.getByText('테스트 메시지')).toBeInTheDocument()
  })

  it('shows edit button when serverId exists and onEdit provided', () => {
    render(
      <UserMessage message={createUserMessage()} onEdit={vi.fn()} />,
    )
    expect(screen.getByLabelText('메시지 수정')).toBeInTheDocument()
  })

  it('hides edit button when serverId is null', () => {
    render(
      <UserMessage
        message={createUserMessage({ serverId: null })}
        onEdit={vi.fn()}
      />,
    )
    expect(screen.queryByLabelText('메시지 수정')).not.toBeInTheDocument()
  })

  it('hides edit button when onEdit is not provided', () => {
    render(<UserMessage message={createUserMessage()} />)
    expect(screen.queryByLabelText('메시지 수정')).not.toBeInTheDocument()
  })

  it('enters edit mode when edit button clicked', async () => {
    const user = userEvent.setup()
    render(
      <UserMessage message={createUserMessage()} onEdit={vi.fn()} />,
    )

    await user.click(screen.getByLabelText('메시지 수정'))
    expect(screen.getByDisplayValue('테스트 메시지')).toBeInTheDocument()
    expect(screen.getByText('저장 & 전송')).toBeInTheDocument()
  })

  it('exits edit mode on cancel', async () => {
    const user = userEvent.setup()
    render(
      <UserMessage message={createUserMessage()} onEdit={vi.fn()} />,
    )

    await user.click(screen.getByLabelText('메시지 수정'))
    await user.click(screen.getByText('취소'))

    expect(screen.getByText('테스트 메시지')).toBeInTheDocument()
    expect(screen.queryByText('저장 & 전송')).not.toBeInTheDocument()
  })

  it('calls onEdit with serverId and new content on save', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()

    render(
      <UserMessage message={createUserMessage()} onEdit={onEdit} />,
    )

    await user.click(screen.getByLabelText('메시지 수정'))
    const textarea = screen.getByDisplayValue('테스트 메시지')
    await user.clear(textarea)
    await user.type(textarea, '수정됨')
    await user.click(screen.getByText('저장 & 전송'))

    expect(onEdit).toHaveBeenCalledWith(10, '수정됨')
  })

  it('shows user avatar', () => {
    const { container } = render(
      <UserMessage message={createUserMessage()} />,
    )
    expect(
      container.querySelector('.rounded-full.bg-zinc-200'),
    ).toBeInTheDocument()
  })
})
