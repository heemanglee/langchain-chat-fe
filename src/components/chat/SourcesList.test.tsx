import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SourcesList } from './SourcesList'

describe('SourcesList', () => {
  it('renders nothing when sources is empty', () => {
    const { container } = render(<SourcesList sources={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders source count', () => {
    render(<SourcesList sources={['doc1.pdf', 'doc2.pdf']} />)
    expect(screen.getByText('출처 (2)')).toBeInTheDocument()
  })

  it('renders each source', () => {
    render(<SourcesList sources={['report.pdf', 'notes.md']} />)
    expect(screen.getByText('report.pdf')).toBeInTheDocument()
    expect(screen.getByText('notes.md')).toBeInTheDocument()
  })
})
