import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { Navbar } from './Navbar'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useAuthStore } from '@/stores/authStore'

vi.mock('@/api/auth', () => ({
  logout: vi.fn().mockResolvedValue({ status: 200, message: 'OK', data: null }),
}))

describe('Navbar', () => {
  beforeEach(() => {
    useSidebarStore.setState({ isOpen: false })
    useAuthStore.setState({
      user: {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
      isAuthenticated: true,
    })
  })

  it('renders logo', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByText('RAG.OS')).toBeInTheDocument()
  })

  it('renders sidebar toggle button', () => {
    renderWithProviders(<Navbar />)
    expect(
      screen.getByRole('button', { name: '사이드바 토글' }),
    ).toBeInTheDocument()
  })

  it('toggles sidebar on button click', async () => {
    const { user } = renderWithProviders(<Navbar />)

    expect(useSidebarStore.getState().isOpen).toBe(false)

    await user.click(screen.getByRole('button', { name: '사이드바 토글' }))

    expect(useSidebarStore.getState().isOpen).toBe(true)
  })

  it('renders theme toggle and user dropdown', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByLabelText(/현재 테마/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '사용자 메뉴' }),
    ).toBeInTheDocument()
  })
})
