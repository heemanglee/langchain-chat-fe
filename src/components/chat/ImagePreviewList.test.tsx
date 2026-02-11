import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImagePreviewList } from './ImagePreviewList'

function createFile(name: string, size = 1024): File {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], name, { type: 'image/jpeg' })
}

describe('ImagePreviewList', () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
    globalThis.URL.createObjectURL = mockCreateObjectURL as typeof URL.createObjectURL
  })

  it('renders nothing when images array is empty', () => {
    const { container } = render(
      <ImagePreviewList images={[]} onRemove={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders preview for each image', () => {
    const images = [createFile('a.jpg'), createFile('b.jpg')]
    render(<ImagePreviewList images={images} onRemove={vi.fn()} />)

    expect(screen.getByAltText('a.jpg')).toBeInTheDocument()
    expect(screen.getByAltText('b.jpg')).toBeInTheDocument()
  })

  it('calls onRemove with correct index when delete button clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    const images = [createFile('a.jpg'), createFile('b.jpg')]
    render(<ImagePreviewList images={images} onRemove={onRemove} />)

    const removeButtons = screen.getAllByRole('button')
    await user.click(removeButtons[1])

    expect(onRemove).toHaveBeenCalledWith(1)
  })

  it('displays file names', () => {
    const images = [createFile('screenshot.png')]
    render(<ImagePreviewList images={images} onRemove={vi.fn()} />)

    expect(screen.getByText('screenshot.png')).toBeInTheDocument()
  })

  it('creates object URLs for previews', () => {
    const images = [createFile('test.jpg')]
    render(<ImagePreviewList images={images} onRemove={vi.fn()} />)

    expect(mockCreateObjectURL).toHaveBeenCalledWith(images[0])
    expect(screen.getByAltText('test.jpg')).toHaveAttribute('src', 'blob:mock-url')
  })

  it('has accessible list role', () => {
    const images = [createFile('a.jpg')]
    render(<ImagePreviewList images={images} onRemove={vi.fn()} />)

    expect(screen.getByRole('list', { name: '첨부 이미지 목록' })).toBeInTheDocument()
  })
})
