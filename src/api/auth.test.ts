import { register, login, logout, refreshToken } from './auth'
import { apiClient } from './client'

vi.mock('./client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

const mockJson = vi.fn()
const mockPost = vi.mocked(apiClient.post)

beforeEach(() => {
  mockPost.mockReturnValue({ json: mockJson } as never)
})

describe('auth API', () => {
  it('register가 올바른 엔드포인트와 데이터로 호출된다', async () => {
    const data = { email: 'test@example.com', password: 'Pass1!', username: '유저' }
    const response = { status: 200, message: 'ok', data: null }
    mockJson.mockResolvedValue(response)

    const result = await register(data)

    expect(mockPost).toHaveBeenCalledWith('api/auth/register', { json: data })
    expect(result).toEqual(response)
  })

  it('login이 올바른 엔드포인트와 데이터로 호출된다', async () => {
    const data = { email: 'test@example.com', password: 'Pass1!' }
    const response = { status: 200, message: 'ok', data: { access_token: 'at', refresh_token: 'rt' } }
    mockJson.mockResolvedValue(response)

    const result = await login(data)

    expect(mockPost).toHaveBeenCalledWith('api/auth/login', { json: data })
    expect(result).toEqual(response)
  })

  it('logout이 올바른 엔드포인트로 호출된다', async () => {
    const response = { status: 200, message: 'ok', data: null }
    mockJson.mockResolvedValue(response)

    const result = await logout()

    expect(mockPost).toHaveBeenCalledWith('api/auth/logout', { json: {} })
    expect(result).toEqual(response)
  })

  it('logout이 refresh_token을 포함하여 호출된다', async () => {
    const data = { refresh_token: 'rt' }
    const response = { status: 200, message: 'ok', data: null }
    mockJson.mockResolvedValue(response)

    await logout(data)

    expect(mockPost).toHaveBeenCalledWith('api/auth/logout', { json: data })
  })

  it('refreshToken이 올바른 엔드포인트와 데이터로 호출된다', async () => {
    const data = { refresh_token: 'rt' }
    const response = { status: 200, message: 'ok', data: { access_token: 'new-at' } }
    mockJson.mockResolvedValue(response)

    const result = await refreshToken(data)

    expect(mockPost).toHaveBeenCalledWith('api/auth/refresh', { json: data })
    expect(result).toEqual(response)
  })
})
