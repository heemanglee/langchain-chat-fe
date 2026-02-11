import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInput } from './ChatInput'

function createFile(name: string, type = 'image/jpeg', size = 1024): File {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], name, { type })
}

describe('ChatInput', () => {
  const defaultProps = {
    onSend: vi.fn(),
    isStreaming: false,
    onStop: vi.fn(),
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    globalThis.alert = vi.fn()
  })

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

    expect(onSend).toHaveBeenCalledWith('안녕하세요', {
      useWebSearch: false,
      images: undefined,
    })
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

    expect(onSend).toHaveBeenCalledWith('검색', {
      useWebSearch: true,
      images: undefined,
    })
  })

  it('submits on Enter key', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} onSend={onSend} />)

    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    await user.type(textarea, '메시지{Enter}')

    expect(onSend).toHaveBeenCalledWith('메시지', {
      useWebSearch: false,
      images: undefined,
    })
  })

  it('does not submit on Shift+Enter', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} onSend={onSend} />)

    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    await user.type(textarea, '줄1{Shift>}{Enter}{/Shift}줄2')

    expect(onSend).not.toHaveBeenCalled()
  })

  // --- 이미지 첨부 테스트 ---

  it('renders image attach button', () => {
    render(<ChatInput {...defaultProps} />)
    expect(screen.getByLabelText('이미지 첨부')).toBeInTheDocument()
  })

  it('shows image previews when images are attached', async () => {
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, createFile('test.jpg'))

    expect(screen.getByAltText('test.jpg')).toBeInTheDocument()
  })

  it('shows image count badge', async () => {
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, [createFile('a.jpg'), createFile('b.jpg')])

    expect(screen.getByText('2/5')).toBeInTheDocument()
  })

  it('passes images to onSend', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput {...defaultProps} onSend={onSend} />)

    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    await user.type(textarea, 'hello')

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, createFile('photo.jpg'))

    await user.click(screen.getByLabelText('메시지 전송'))

    expect(onSend).toHaveBeenCalledWith('hello', {
      useWebSearch: false,
      images: [expect.objectContaining({ name: 'photo.jpg' })],
    })
  })

  it('clears images after sending', async () => {
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, createFile('photo.jpg'))
    expect(screen.getByAltText('photo.jpg')).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
    await user.type(textarea, 'test')
    await user.click(screen.getByLabelText('메시지 전송'))

    expect(screen.queryByAltText('photo.jpg')).not.toBeInTheDocument()
  })

  it('can send with only images (no text)', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInput {...defaultProps} onSend={onSend} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, createFile('photo.jpg'))

    const sendButton = screen.getByLabelText('메시지 전송')
    expect(sendButton).not.toBeDisabled()
    await user.click(sendButton)

    expect(onSend).toHaveBeenCalledWith('', {
      useWebSearch: false,
      images: [expect.objectContaining({ name: 'photo.jpg' })],
    })
  })

  it('blocks attachment over 5 images', async () => {
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, [
      createFile('a.jpg'),
      createFile('b.jpg'),
      createFile('c.jpg'),
      createFile('d.jpg'),
      createFile('e.jpg'),
    ])

    expect(screen.getByText('5/5')).toBeInTheDocument()

    await user.upload(fileInput, createFile('f.jpg'))
    expect(globalThis.alert).toHaveBeenCalledWith(
      expect.stringContaining('최대 5장'),
    )
  })

  it('rejects unsupported file types', () => {
    render(<ChatInput {...defaultProps} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const badFile = new File(['data'], 'doc.pdf', { type: 'application/pdf' })

    // fireEvent로 accept 속성 우회
    fireEvent.change(fileInput, { target: { files: [badFile] } })

    expect(globalThis.alert).toHaveBeenCalledWith(
      expect.stringContaining('지원하지 않는 이미지 형식'),
    )
  })

  it('rejects files over 10MB', async () => {
    const user = userEvent.setup()
    render(<ChatInput {...defaultProps} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const bigFile = createFile('huge.jpg', 'image/jpeg', 11 * 1024 * 1024)
    await user.upload(fileInput, bigFile)

    expect(globalThis.alert).toHaveBeenCalledWith(
      expect.stringContaining('10MB를 초과'),
    )
  })

  it('disables attach button while streaming', () => {
    render(<ChatInput {...defaultProps} isStreaming={true} />)
    expect(screen.getByLabelText('이미지 첨부')).toBeDisabled()
  })
})
