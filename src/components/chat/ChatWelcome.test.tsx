import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatWelcome } from './ChatWelcome'

describe('ChatWelcome', () => {
  it('renders logo and greeting', () => {
    render(<ChatWelcome />)
    expect(screen.getByText('RAG.OS')).toBeInTheDocument()
    expect(screen.getByText('무엇을 도와드릴까요?')).toBeInTheDocument()
  })

  it('renders suggestion cards', () => {
    render(<ChatWelcome />)
    expect(screen.getByText('아이디어 브레인스토밍')).toBeInTheDocument()
    expect(screen.getByText('문서 요약하기')).toBeInTheDocument()
    expect(screen.getByText('코드 설명하기')).toBeInTheDocument()
    expect(screen.getByText('정보 검색하기')).toBeInTheDocument()
  })
})
