export interface RegisterRequest {
  email: string
  password: string
  username: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LogoutRequest {
  refresh_token?: string
}

export interface RefreshRequest {
  refresh_token: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface UserResponse {
  id: number
  email: string
  username: string
  role: string
  is_active: boolean
  created_at: string
}

export interface RegisterResponse {
  user: UserResponse
  tokens: TokenResponse
}

export interface MessageResponse {
  message: string
}
