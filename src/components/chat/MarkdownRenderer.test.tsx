import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('renders [cite:N] as clickable citation button', async () => {
    const user = userEvent.setup()
    const onCitationClick = vi.fn()
    render(
      <MarkdownRenderer
        content="요약 문장입니다. [cite:3]"
        onCitationClick={onCitationClick}
      />,
    )

    await user.click(screen.getByRole('button', { name: '출처 3' }))
    expect(onCitationClick).toHaveBeenCalledWith('lib-3')
  })

  it('converts escaped citation markers to clickable button', async () => {
    const user = userEvent.setup()
    const onCitationClick = vi.fn()
    render(
      <MarkdownRenderer
        content={String.raw`요약 문장입니다. \[cite:2\]`}
        onCitationClick={onCitationClick}
      />,
    )

    await user.click(screen.getByRole('button', { name: '출처 2' }))
    expect(onCitationClick).toHaveBeenCalledWith('lib-2')
  })

  it('converts localized citation markers to clickable button', async () => {
    const user = userEvent.setup()
    const onCitationClick = vi.fn()
    render(
      <MarkdownRenderer
        content="요약 문장입니다. [시민투입:3]"
        onCitationClick={onCitationClick}
      />,
    )

    await user.click(screen.getByRole('button', { name: '출처 3' }))
    expect(onCitationClick).toHaveBeenCalledWith('lib-3')
  })

  it('supports full-width colon in citation markers', async () => {
    const user = userEvent.setup()
    const onCitationClick = vi.fn()
    render(
      <MarkdownRenderer
        content="요약 문장입니다. [시민투입：4]"
        onCitationClick={onCitationClick}
      />,
    )

    await user.click(screen.getByRole('button', { name: '출처 4' }))
    expect(onCitationClick).toHaveBeenCalledWith('lib-4')
  })
})
