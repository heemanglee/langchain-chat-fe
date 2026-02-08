import { useAuthStore } from './authStore'
import type { TokenResponse, UserResponse } from '@/types/auth'

const mockTokens: TokenResponse = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
}

const mockUser: UserResponse = {
  id: 1,
  email: 'test@example.com',
  username: '테스트유저',
  role: 'user',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    })
  })

  it('초기 상태가 올바르다', () => {
    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('setTokens가 토큰을 저장하고 인증 상태를 변경한다', () => {
    useAuthStore.getState().setTokens(mockTokens)
    const state = useAuthStore.getState()

    expect(state.accessToken).toBe('test-access-token')
    expect(state.refreshToken).toBe('test-refresh-token')
    expect(state.isAuthenticated).toBe(true)
    expect(localStorage.getItem('access_token')).toBe('test-access-token')
    expect(localStorage.getItem('refresh_token')).toBe('test-refresh-token')
  })

  it('setUser가 사용자 정보를 저장한다', () => {
    useAuthStore.getState().setUser(mockUser)
    const state = useAuthStore.getState()

    expect(state.user).toEqual(mockUser)
  })

  it('clearAuth가 모든 상태와 localStorage를 초기화한다', () => {
    useAuthStore.getState().setTokens(mockTokens)
    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().clearAuth()

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('hydrate가 localStorage에서 토큰을 복원한다', () => {
    localStorage.setItem('access_token', 'stored-access')
    localStorage.setItem('refresh_token', 'stored-refresh')

    useAuthStore.getState().hydrate()
    const state = useAuthStore.getState()

    expect(state.accessToken).toBe('stored-access')
    expect(state.refreshToken).toBe('stored-refresh')
    expect(state.isAuthenticated).toBe(true)
  })

  it('hydrate가 토큰이 없으면 상태를 변경하지 않는다', () => {
    useAuthStore.getState().hydrate()
    const state = useAuthStore.getState()

    expect(state.accessToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('hydrate가 access_token만 있고 refresh_token이 없으면 인증하지 않는다', () => {
    localStorage.setItem('access_token', 'stored-access')

    useAuthStore.getState().hydrate()
    const state = useAuthStore.getState()

    expect(state.isAuthenticated).toBe(false)
  })
})
