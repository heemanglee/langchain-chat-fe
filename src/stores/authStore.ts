import { create } from 'zustand'
import type { UserResponse, TokenResponse } from '@/types/auth'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean

  setTokens: (tokens: TokenResponse) => void
  setUser: (user: UserResponse) => void
  clearAuth: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  setTokens: (tokens: TokenResponse) => {
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      isAuthenticated: true,
    })
  },

  setUser: (user: UserResponse) => {
    set({ user })
  },

  clearAuth: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    })
  },

  hydrate: () => {
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    if (accessToken && refreshToken) {
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
      })
    }
  },
}))
