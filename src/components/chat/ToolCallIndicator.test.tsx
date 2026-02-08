import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToolCallIndicator } from './ToolCallIndicator'

describe('ToolCallIndicator', () => {
  it('renders calling state', () => {
    render(<ToolCallIndicator name="web_search" status="calling" />)
    expect(screen.getByText('web_search 실행 중...')).toBeInTheDocument()
  })

  it('renders done state', () => {
    render(<ToolCallIndicator name="web_search" status="done" />)
    expect(screen.getByText('web_search 완료')).toBeInTheDocument()
  })
})
