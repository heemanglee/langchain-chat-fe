import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToolCallBadge } from './ToolCallBadge'

describe('ToolCallBadge', () => {
  it('renders tool call name', () => {
    render(
      <ToolCallBadge
        toolCall={{ name: 'web_search', args: { query: 'test' }, id: 'tc-1' }}
      />,
    )
    expect(screen.getByText('web_search')).toBeInTheDocument()
  })

  it('applies blue pill styling', () => {
    const { container } = render(
      <ToolCallBadge
        toolCall={{ name: 'search', args: {}, id: 'tc-1' }}
      />,
    )
    const badge = container.firstElementChild
    expect(badge?.className).toContain('bg-blue-50')
    expect(badge?.className).toContain('text-blue-600')
  })
})
