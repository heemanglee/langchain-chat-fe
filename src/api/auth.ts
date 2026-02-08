import { apiClient } from './client'
import type { ApiResponse } from '@/types/api'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  TokenResponse,
  LogoutRequest,
  RefreshRequest,
  MessageResponse,
} from '@/types/auth'

export function register(
  data: RegisterRequest,
): Promise<ApiResponse<RegisterResponse>> {
  return apiClient.post('api/auth/register', { json: data }).json()
}

export function login(
  data: LoginRequest,
): Promise<ApiResponse<TokenResponse>> {
  return apiClient.post('api/auth/login', { json: data }).json()
}

export function logout(
  data?: LogoutRequest,
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.post('api/auth/logout', { json: data ?? {} }).json()
}

export function refreshToken(
  data: RefreshRequest,
): Promise<ApiResponse<TokenResponse>> {
  return apiClient.post('api/auth/refresh', { json: data }).json()
}
