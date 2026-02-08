import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToolUsageSummary } from './ToolUsageSummary'

describe('ToolUsageSummary', () => {
  it('returns null when tools is empty', () => {
    const { container } = render(<ToolUsageSummary tools={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders single tool name', () => {
    render(<ToolUsageSummary tools={['web_search']} />)
    expect(screen.getByText('web_search')).toBeInTheDocument()
  })

  it('renders multiple unique tools', () => {
    render(
      <ToolUsageSummary tools={['web_search', 'document_retrieval']} />,
    )
    expect(screen.getByText('web_search')).toBeInTheDocument()
    expect(screen.getByText('document_retrieval')).toBeInTheDocument()
  })

  it('applies pill styling', () => {
    render(<ToolUsageSummary tools={['web_search']} />)
    const pill = screen.getByText('web_search').closest('span')
    expect(pill?.className).toContain('rounded-full')
    expect(pill?.className).toContain('bg-zinc-100')
  })
})
