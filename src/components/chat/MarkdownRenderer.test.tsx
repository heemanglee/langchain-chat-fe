import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownRenderer } from './MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders plain text', () => {
    render(<MarkdownRenderer content="안녕하세요" />)
    expect(screen.getByText('안녕하세요')).toBeInTheDocument()
  })

  it('renders bold text', () => {
    render(<MarkdownRenderer content="**굵은 글씨**" />)
    expect(screen.getByText('굵은 글씨')).toBeInTheDocument()
  })

  it('renders unordered list', () => {
    render(<MarkdownRenderer content={'- 항목 1\n- 항목 2'} />)
    expect(screen.getByText('항목 1')).toBeInTheDocument()
    expect(screen.getByText('항목 2')).toBeInTheDocument()
  })

  it('renders inline code', () => {
    render(<MarkdownRenderer content="Use `npm install`" />)
    expect(screen.getByText('npm install')).toBeInTheDocument()
  })

  it('renders code block with language', () => {
    render(
      <MarkdownRenderer
        content={'```python\nprint("hello")\n```'}
      />,
    )
    expect(screen.getByText('print("hello")')).toBeInTheDocument()
    expect(screen.getByText('python')).toBeInTheDocument()
  })

  it('renders links with target _blank', () => {
    render(<MarkdownRenderer content="[링크](https://example.com)" />)
    const link = screen.getByText('링크')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders heading', () => {
    render(<MarkdownRenderer content="## 제목" />)
    expect(screen.getByText('제목')).toBeInTheDocument()
  })
})
