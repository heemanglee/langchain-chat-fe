import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { Login } from './Login'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

const mockNavigate = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
}))

const mockLogin = vi.mocked(login)

describe('Login', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockLogin.mockClear()
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    })
  })

  it('로그인 폼이 렌더링된다', () => {
    renderWithProviders(<Login />)

    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  it('회원가입 링크가 표시된다', () => {
    renderWithProviders(<Login />)

    const link = screen.getByRole('link', { name: '회원가입' })
    expect(link).toHaveAttribute('href', '/register')
  })

  it('빈 폼 제출 시 유효성 검증 에러가 표시된다', async () => {
    const { user } = renderWithProviders(<Login />)

    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument()
    })
  })

  it('잘못된 이메일 형식 시 에러가 표시된다', async () => {
    const { user } = renderWithProviders(<Login />)

    await user.type(screen.getByLabelText('이메일'), 'invalid')
    await user.type(screen.getByLabelText('비밀번호'), 'password')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument()
    })
  })

  it('빈 비밀번호 시 에러가 표시된다', async () => {
    const { user } = renderWithProviders(<Login />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument()
    })
  })

  it('로그인 성공 시 토큰을 저장하고 /chat으로 이동한다', async () => {
    mockLogin.mockResolvedValue({
      status: 200,
      message: 'ok',
      data: {
        access_token: 'at',
        refresh_token: 'rt',
        token_type: 'bearer',
        expires_in: 3600,
      },
    })

    const { user } = renderWithProviders(<Login />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/chat', { replace: true })
    })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('로그인 실패 시 에러 Alert가 표시된다', async () => {
    mockLogin.mockRejectedValue(new Error('Unauthorized'))

    const { user } = renderWithProviders(<Login />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '이메일 또는 비밀번호가 올바르지 않습니다',
      )
    })
  })

  it('로그인 API 호출 시 올바른 데이터가 전달된다', async () => {
    mockLogin.mockResolvedValue({
      status: 200,
      message: 'ok',
      data: {
        access_token: 'at',
        refresh_token: 'rt',
        token_type: 'bearer',
        expires_in: 3600,
      },
    })

    const { user } = renderWithProviders(<Login />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password1!',
      })
    })
  })

  it('제출 중 버튼이 비활성화된다', async () => {
    let resolveLogin!: (value: Awaited<ReturnType<typeof login>>) => void
    mockLogin.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve
      }),
    )

    const { user } = renderWithProviders(<Login />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled()
    })

    resolveLogin({
      status: 200,
      message: 'ok',
      data: { access_token: 'at', refresh_token: 'rt', token_type: 'bearer', expires_in: 3600 },
    })
  })

  it('재시도 시 이전 에러 메시지가 사라진다', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Unauthorized'))

    const { user } = renderWithProviders(<Login />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'Password1!')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    mockLogin.mockResolvedValueOnce({
      status: 200,
      message: 'ok',
      data: { access_token: 'at', refresh_token: 'rt', token_type: 'bearer', expires_in: 3600 },
    })

    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
