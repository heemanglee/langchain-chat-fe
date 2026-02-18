import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SourcesList } from './SourcesList'
import type { Citation, LibraryCitation } from '@/types/chat'

function createSources(): Citation[] {
  return [
    {
      citation_id: 'web-1',
      source_type: 'web',
      title: '검색 결과',
      snippet: null,
      url: 'https://example.com',
    },
    {
      citation_id: 'lib-1',
      source_type: 'library',
      title: 'report.pdf',
      snippet: '요약',
      file_id: 1,
      file_name: 'report.pdf',
      anchors: [
        {
          anchor_id: 'a-1',
          page: 1,
          line_start: null,
          line_end: null,
          start_char: 0,
          end_char: 10,
          bbox: null,
          quote: 'quoted text',
        },
      ],
    },
  ]
}

describe('SourcesList', () => {
  it('renders nothing when sources is empty', () => {
    const { container } = render(<SourcesList sources={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders source count', () => {
    render(<SourcesList sources={createSources()} />)
    expect(screen.getByText('출처 (2)')).toBeInTheDocument()
  })

  it('opens web source in new tab', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const user = userEvent.setup()

    render(<SourcesList sources={createSources()} />)
    await user.click(screen.getByRole('button', { name: /검색 결과/i }))

    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('calls onOpenLibraryCitation for library source', async () => {
    const onOpenLibraryCitation = vi.fn()
    const user = userEvent.setup()

    render(
      <SourcesList
        sources={createSources()}
        onOpenLibraryCitation={onOpenLibraryCitation}
      />,
    )

    await user.click(screen.getByRole('button', { name: /report\.pdf/i }))

    expect(onOpenLibraryCitation).toHaveBeenCalledWith(
      expect.objectContaining<Partial<LibraryCitation>>({
        citation_id: 'lib-1',
      }),
      'a-1',
    )
  })
})
