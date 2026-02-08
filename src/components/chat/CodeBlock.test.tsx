import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeBlock } from './CodeBlock'

describe('CodeBlock', () => {
  it('renders code content', () => {
    render(<CodeBlock language="python">print("hello")</CodeBlock>)
    expect(screen.getByText('print("hello")')).toBeInTheDocument()
  })

  it('displays language label', () => {
    render(<CodeBlock language="typescript">const x = 1</CodeBlock>)
    expect(screen.getByText('typescript')).toBeInTheDocument()
  })

  it('displays "code" when no language provided', () => {
    render(<CodeBlock>const x = 1</CodeBlock>)
    expect(screen.getByText('code')).toBeInTheDocument()
  })

  it('shows copied state on click', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)

    const user = userEvent.setup()
    render(<CodeBlock language="js">const x = 1</CodeBlock>)

    await user.click(screen.getByRole('button', { name: '코드 복사' }))

    await waitFor(() => {
      expect(screen.getByText('복사됨')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: '복사됨' })).toBeInTheDocument()
  })
})
