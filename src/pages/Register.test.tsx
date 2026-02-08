import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { Register } from './Register'
import { register as registerApi } from '@/api/auth'
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
  register: vi.fn(),
}))

const mockRegister = vi.mocked(registerApi)

const validForm = {
  username: '테스트유저',
  email: 'test@example.com',
  password: 'Password1!',
  confirmPassword: 'Password1!',
}

async function fillForm(
  user: ReturnType<typeof import('@testing-library/user-event')['default']['setup']>,
  overrides: Partial<typeof validForm> = {},
) {
  const data = { ...validForm, ...overrides }
  if (data.username) await user.type(screen.getByLabelText('이름'), data.username)
  if (data.email) await user.type(screen.getByLabelText('이메일'), data.email)
  if (data.password) await user.type(screen.getByLabelText('비밀번호'), data.password)
  if (data.confirmPassword)
    await user.type(screen.getByLabelText('비밀번호 확인'), data.confirmPassword)
}

describe('Register', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockRegister.mockClear()
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    })
  })

  it('회원가입 폼이 렌더링된다', () => {
    renderWithProviders(<Register />)

    expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument()
    expect(screen.getByLabelText('이름')).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument()
  })

  it('로그인 링크가 표시된다', () => {
    renderWithProviders(<Register />)

    const link = screen.getByRole('link', { name: '로그인' })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('빈 폼 제출 시 유효성 검증 에러가 표시된다', async () => {
    const { user } = renderWithProviders(<Register />)

    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('이름은 2자 이상이어야 합니다')).toBeInTheDocument()
    })
  })

  it('username이 너무 짧으면 에러가 표시된다', async () => {
    const { user } = renderWithProviders(<Register />)

    await fillForm(user, { username: '가' })
    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('이름은 2자 이상이어야 합니다')).toBeInTheDocument()
    })
  })

  it('잘못된 이메일 형식 시 에러가 표시된다', async () => {
    const { user } = renderWithProviders(<Register />)

    await fillForm(user, { email: 'bad-email' })
    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument()
    })
  })

  it('비밀번호 복잡성 미충족 시 에러가 표시된다', async () => {
    const { user } = renderWithProviders(<Register />)

    await fillForm(user, { password: 'short', confirmPassword: 'short' })
    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('비밀번호는 8자 이상이어야 합니다')).toBeInTheDocument()
    })
  })

  it('비밀번호 불일치 시 에러가 표시된다', async () => {
    const { user } = renderWithProviders(<Register />)

    await fillForm(user, { confirmPassword: 'Different1!' })
    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다')).toBeInTheDocument()
    })
  })

  it('회원가입 성공 시 자동 로그인되고 /chat으로 이동한다', async () => {
    mockRegister.mockResolvedValue({
      status: 201,
      message: 'ok',
      data: {
        user: {
          id: 1,
          email: 'test@example.com',
          username: '테스트유저',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
        },
        tokens: {
          access_token: 'at',
          refresh_token: 'rt',
          token_type: 'bearer',
          expires_in: 3600,
        },
      },
    })

    const { user } = renderWithProviders(<Register />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/chat', { replace: true })
    })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().user?.username).toBe('테스트유저')
  })

  it('회원가입 API에 confirmPassword가 전달되지 않는다', async () => {
    mockRegister.mockResolvedValue({
      status: 201,
      message: 'ok',
      data: {
        user: {
          id: 1,
          email: 'test@example.com',
          username: '테스트유저',
          role: 'user',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
        },
        tokens: {
          access_token: 'at',
          refresh_token: 'rt',
          token_type: 'bearer',
          expires_in: 3600,
        },
      },
    })

    const { user } = renderWithProviders(<Register />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: '테스트유저',
        email: 'test@example.com',
        password: 'Password1!',
      })
    })
  })

  it('회원가입 실패 시 에러 Alert가 표시된다', async () => {
    mockRegister.mockRejectedValue(new Error('Conflict'))

    const { user } = renderWithProviders(<Register />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '회원가입에 실패했습니다. 다시 시도해주세요',
      )
    })
  })

  it('제출 중 버튼이 비활성화된다', async () => {
    let resolveRegister!: (value: Awaited<ReturnType<typeof registerApi>>) => void
    mockRegister.mockReturnValue(
      new Promise((resolve) => {
        resolveRegister = resolve
      }),
    )

    const { user } = renderWithProviders(<Register />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled()
    })

    resolveRegister({
      status: 201,
      message: 'ok',
      data: {
        user: { id: 1, email: 'a@b.com', username: 'u', role: 'user', is_active: true, created_at: '' },
        tokens: { access_token: 'at', refresh_token: 'rt', token_type: 'bearer', expires_in: 3600 },
      },
    })
  })
})
