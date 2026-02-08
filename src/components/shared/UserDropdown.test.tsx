import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { UserDropdown } from './UserDropdown'
import { useAuthStore } from '@/stores/authStore'

vi.mock('@/api/auth', () => ({
  logout: vi.fn().mockResolvedValue({ status: 200, message: 'OK', data: null }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('UserDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
      refreshToken: 'rt_test',
      isAuthenticated: true,
    })
  })

  it('renders user menu button', () => {
    renderWithProviders(<UserDropdown />)
    expect(
      screen.getByRole('button', { name: '사용자 메뉴' }),
    ).toBeInTheDocument()
  })

  it('shows dropdown on click', async () => {
    const { user } = renderWithProviders(<UserDropdown />)

    await user.click(screen.getByRole('button', { name: '사용자 메뉴' }))

    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('로그아웃')).toBeInTheDocument()
  })

  it('closes dropdown on second click', async () => {
    const { user } = renderWithProviders(<UserDropdown />)
    const button = screen.getByRole('button', { name: '사용자 메뉴' })

    await user.click(button)
    expect(screen.getByText('testuser')).toBeInTheDocument()

    await user.click(button)
    expect(screen.queryByText('testuser')).not.toBeInTheDocument()
  })

  it('calls logout and navigates to login', async () => {
    const { user } = renderWithProviders(<UserDropdown />)

    await user.click(screen.getByRole('button', { name: '사용자 메뉴' }))
    await user.click(screen.getByText('로그아웃'))

    expect(mockNavigate).toHaveBeenCalledWith('/login')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
