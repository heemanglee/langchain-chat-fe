import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { SidebarConversationItem } from './SidebarConversationItem'
import type { ConversationSummary } from '@/types/chat'

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return { ...actual, useNavigate: () => mockNavigate }
})

const conversation: ConversationSummary = {
  conversation_id: 'c1',
  title: '테스트 대화',
  last_message_preview: '마지막 메시지',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('SidebarConversationItem', () => {
  it('renders conversation title', () => {
    renderWithProviders(
      <SidebarConversationItem conversation={conversation} isActive={false} />,
    )
    expect(screen.getByText('테스트 대화')).toBeInTheDocument()
  })

  it('renders last message preview', () => {
    renderWithProviders(
      <SidebarConversationItem conversation={conversation} isActive={false} />,
    )
    expect(screen.getByText('마지막 메시지')).toBeInTheDocument()
  })

  it('shows "새 대화" when title is null', () => {
    renderWithProviders(
      <SidebarConversationItem
        conversation={{ ...conversation, title: null }}
        isActive={false}
      />,
    )
    expect(screen.getByText('새 대화')).toBeInTheDocument()
  })

  it('navigates on click', async () => {
    const { user } = renderWithProviders(
      <SidebarConversationItem conversation={conversation} isActive={false} />,
    )

    await user.click(screen.getByText('테스트 대화'))
    expect(mockNavigate).toHaveBeenCalledWith('/chat/c1')
  })

  it('calls onSelect on click', async () => {
    const onSelect = vi.fn()
    const { user } = renderWithProviders(
      <SidebarConversationItem
        conversation={conversation}
        isActive={false}
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByText('테스트 대화'))
    expect(onSelect).toHaveBeenCalled()
  })

  it('sets aria-current when active', () => {
    renderWithProviders(
      <SidebarConversationItem conversation={conversation} isActive={true} />,
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-current', 'page')
  })
})
