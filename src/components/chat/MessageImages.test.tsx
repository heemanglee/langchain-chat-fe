import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MessageImages } from './MessageImages'
import type { ImageSummary } from '@/types/chat'

function createImage(overrides: Partial<ImageSummary> = {}): ImageSummary {
  return {
    id: 1,
    original_url: 'https://s3.example.com/original.jpg',
    thumbnail_url: 'https://s3.example.com/thumb.jpg',
    content_type: 'image/jpeg',
    original_size: 204800,
    width: 1920,
    height: 1080,
    original_filename: 'photo.jpg',
    ...overrides,
  }
}

describe('MessageImages', () => {
  it('renders single image without grid layout', () => {
    const images = [createImage()]
    const { container } = render(<MessageImages images={images} />)

    const img = screen.getByAltText('photo.jpg')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://s3.example.com/thumb.jpg')

    const wrapper = container.firstElementChild
    expect(wrapper?.className).not.toContain('grid')
  })

  it('renders multiple images in a 2-column grid with max-w-sm', () => {
    const images = [
      createImage({ id: 1, original_filename: 'a.jpg' }),
      createImage({ id: 2, original_filename: 'b.jpg' }),
    ]
    const { container } = render(<MessageImages images={images} />)

    expect(screen.getByAltText('a.jpg')).toBeInTheDocument()
    expect(screen.getByAltText('b.jpg')).toBeInTheDocument()

    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('grid-cols-2')
    expect(wrapper?.className).toContain('max-w-sm')
  })

  it('links to original_url opening in new tab', () => {
    const images = [createImage()]
    render(<MessageImages images={images} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://s3.example.com/original.jpg')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders five images in grid', () => {
    const images = Array.from({ length: 5 }, (_, i) =>
      createImage({ id: i + 1, original_filename: `img-${i + 1}.jpg` }),
    )
    render(<MessageImages images={images} />)

    expect(screen.getAllByRole('link')).toHaveLength(5)
  })

  it('sets width and height attributes when values are positive', () => {
    const images = [createImage({ width: 800, height: 600 })]
    render(<MessageImages images={images} />)

    const img = screen.getByAltText('photo.jpg')
    expect(img).toHaveAttribute('width', '800')
    expect(img).toHaveAttribute('height', '600')
  })

  it('omits width and height attributes when values are zero', () => {
    const images = [createImage({ width: 0, height: 0 })]
    render(<MessageImages images={images} />)

    const img = screen.getByAltText('photo.jpg')
    expect(img).not.toHaveAttribute('width')
    expect(img).not.toHaveAttribute('height')
  })

  it('falls back to original_url when thumbnail_url fails', () => {
    const images = [createImage()]
    render(<MessageImages images={images} />)

    const img = screen.getByAltText('photo.jpg')
    expect(img).toHaveAttribute('src', 'https://s3.example.com/thumb.jpg')

    fireEvent.error(img)

    const retryImg = screen.getByAltText('photo.jpg')
    expect(retryImg).toHaveAttribute('src', 'https://s3.example.com/original.jpg')
  })

  it('shows fallback after both thumbnail and original fail', () => {
    const images = [createImage()]
    render(<MessageImages images={images} />)

    const img = screen.getByAltText('photo.jpg')
    fireEvent.error(img)

    const retryImg = screen.getByAltText('photo.jpg')
    fireEvent.error(retryImg)

    expect(screen.queryByAltText('photo.jpg')).not.toBeInTheDocument()
    expect(screen.getByText('photo.jpg')).toBeInTheDocument()
  })

  it('shows fallback immediately when thumbnail equals original', () => {
    const sameUrl = 'blob:same-url'
    const images = [createImage({ thumbnail_url: sameUrl, original_url: sameUrl })]
    render(<MessageImages images={images} />)

    const img = screen.getByAltText('photo.jpg')
    fireEvent.error(img)

    expect(screen.queryByAltText('photo.jpg')).not.toBeInTheDocument()
    expect(screen.getByText('photo.jpg')).toBeInTheDocument()
  })
})
