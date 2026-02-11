import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMessage } from './UserMessage'
import type { ImageSummary, Message } from '@/types/chat'

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

  // --- 이미지 표시 테스트 ---

  it('renders images when message has images', () => {
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
    render(<UserMessage message={createUserMessage({ images })} />)

    expect(screen.getByAltText('photo.jpg')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://s3.example.com/original.jpg',
    )
  })

  it('does not render MessageImages when images is undefined', () => {
    render(<UserMessage message={createUserMessage()} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('does not render MessageImages when images is empty', () => {
    render(<UserMessage message={createUserMessage({ images: [] })} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders multiple images', () => {
    const images: ImageSummary[] = [
      {
        id: 1,
        original_url: 'https://s3.example.com/a.jpg',
        thumbnail_url: 'https://s3.example.com/thumb-a.jpg',
        content_type: 'image/jpeg',
        original_size: 100000,
        width: 800,
        height: 600,
        original_filename: 'a.jpg',
      },
      {
        id: 2,
        original_url: 'https://s3.example.com/b.png',
        thumbnail_url: 'https://s3.example.com/thumb-b.png',
        content_type: 'image/png',
        original_size: 200000,
        width: 1024,
        height: 768,
        original_filename: 'b.png',
      },
    ]
    render(<UserMessage message={createUserMessage({ images })} />)

    expect(screen.getByAltText('a.jpg')).toBeInTheDocument()
    expect(screen.getByAltText('b.png')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })
})
