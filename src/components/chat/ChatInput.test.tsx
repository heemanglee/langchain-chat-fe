import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInput } from './ChatInput'

describe('ChatInput', () => {
  const defaultProps = {
    onSend: vi.fn(),
    isStreaming: false,
    onStop: vi.fn(),
  }

  it('renders textarea with placeholder', () => {
    render(<ChatInput {...defaultProps} />)
    expect(
      screen.getByPlaceholderText('메시지를 입력하세요...'),
    ).toBeInTheDocument()
  })

  it('disables send button when input is empty', () => {
    render(<ChatInput {...defaultProps} />)
    expect(screen.getByRole('button', { name: '메시지 전송' })).toBeDisabled()
  })

  it('enables send button when input has text', async () => {
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} />)

    await user.type(
      screen.getByPlaceholderText('메시지를 입력하세요...'),
      '안녕',
    )

    expect(
      screen.getByRole('button', { name: '메시지 전송' }),
    ).not.toBeDisabled()
  })

  it('calls onSend with trimmed input on submit', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} onSend={onSend} />)

    await user.type(
      screen.getByPlaceholderText('메시지를 입력하세요...'),
      '  안녕하세요  ',
    )
    await user.click(screen.getByRole('button', { name: '메시지 전송' }))

    expect(onSend).toHaveBeenCalledWith('안녕하세요', { useWebSearch: false })
  })

  it('clears input after send', async () => {
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} />)

    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    await user.type(textarea, '테스트')
    await user.click(screen.getByRole('button', { name: '메시지 전송' }))

    expect(textarea).toHaveValue('')
  })

  it('shows stop button when streaming', () => {
    render(<ChatInput {...defaultProps} isStreaming={true} />)
    expect(screen.getByRole('button', { name: '응답 중단' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '메시지 전송' }),
    ).not.toBeInTheDocument()
  })

  it('calls onStop when stop button is clicked', async () => {
    const onStop = vi.fn()
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} isStreaming={true} onStop={onStop} />)

    await user.click(screen.getByRole('button', { name: '응답 중단' }))
    expect(onStop).toHaveBeenCalled()
  })

  it('toggles web search', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} onSend={onSend} />)

    await user.click(screen.getByRole('button', { name: '웹 검색 꺼짐' }))
    expect(
      screen.getByRole('button', { name: '웹 검색 켜짐' }),
    ).toBeInTheDocument()

    await user.type(
      screen.getByPlaceholderText('메시지를 입력하세요...'),
      '검색',
    )
    await user.click(screen.getByRole('button', { name: '메시지 전송' }))

    expect(onSend).toHaveBeenCalledWith('검색', { useWebSearch: true })
  })

  it('submits on Enter key', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} onSend={onSend} />)

    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    await user.type(textarea, '메시지{Enter}')

    expect(onSend).toHaveBeenCalledWith('메시지', { useWebSearch: false })
  })

  it('does not submit on Shift+Enter', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} onSend={onSend} />)

    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    await user.type(textarea, '줄1{Shift>}{Enter}{/Shift}줄2')

    expect(onSend).not.toHaveBeenCalled()
  })
})
