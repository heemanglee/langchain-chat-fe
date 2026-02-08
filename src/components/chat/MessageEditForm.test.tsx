import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageEditForm } from './MessageEditForm'

describe('MessageEditForm', () => {
  it('renders with initial content', () => {
    render(
      <MessageEditForm
        initialContent="원래 내용"
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByDisplayValue('원래 내용')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()

    render(
      <MessageEditForm
        initialContent="내용"
        onSave={vi.fn()}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByText('취소'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onSave with trimmed content', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()

    render(
      <MessageEditForm
        initialContent="원래 내용"
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    )

    const textarea = screen.getByDisplayValue('원래 내용')
    await user.clear(textarea)
    await user.type(textarea, '수정된 내용')
    await user.click(screen.getByText('저장 & 전송'))

    expect(onSave).toHaveBeenCalledWith('수정된 내용')
  })

  it('disables save button when content is empty', async () => {
    const user = userEvent.setup()

    render(
      <MessageEditForm
        initialContent="내용"
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const textarea = screen.getByDisplayValue('내용')
    await user.clear(textarea)

    expect(screen.getByText('저장 & 전송')).toBeDisabled()
  })

  it('does not call onSave with empty content', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()

    render(
      <MessageEditForm
        initialContent=""
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    )

    await user.click(screen.getByText('저장 & 전송'))
    expect(onSave).not.toHaveBeenCalled()
  })
})
