import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { register as registerApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { registerSchema, type RegisterFormData } from '@/schemas/auth'
import { FormField } from '@/components/ui/FormField'
import { Alert } from '@/components/ui/Alert'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

function Register() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormData) {
    setApiError(null)
    try {
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
      }
      const response = await registerApi(payload)
      if (response.data) {
        setTokens(response.data.tokens)
        setUser(response.data.user)
        navigate('/chat', { replace: true })
      }
    } catch {
      setApiError('회원가입에 실패했습니다. 다시 시도해주세요')
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          회원가입
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          새 계정을 만들어보세요
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <Alert variant="error">{apiError}</Alert>}

        <FormField
          label="이름"
          type="text"
          placeholder="이름을 입력하세요"
          autoComplete="name"
          error={errors.username?.message}
          {...register('username')}
        />

        <FormField
          label="이메일"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <FormField
          label="비밀번호"
          type="password"
          placeholder="8자 이상, 대소문자+숫자+특수문자"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <FormField
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? <LoadingSpinner size="sm" /> : '회원가입'}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        이미 계정이 있으신가요?{' '}
        <Link
          to="/login"
          className="font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
        >
          로그인
        </Link>
      </p>
    </div>
  )
}

export { Register }
