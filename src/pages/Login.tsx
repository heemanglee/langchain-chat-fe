import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { loginSchema, type LoginFormData } from '@/schemas/auth'
import { FormField } from '@/components/ui/FormField'
import { Alert } from '@/components/ui/Alert'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

function Login() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setApiError(null)
    try {
      const response = await login(data)
      if (response.data) {
        setTokens(response.data)
        navigate('/chat', { replace: true })
      }
    } catch {
      setApiError('이메일 또는 비밀번호가 올바르지 않습니다')
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          로그인
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          계정에 로그인하세요
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <Alert variant="error">{apiError}</Alert>}

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
          placeholder="비밀번호를 입력하세요"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? <LoadingSpinner size="sm" /> : '로그인'}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        계정이 없으신가요?{' '}
        <Link
          to="/register"
          className="font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
        >
          회원가입
        </Link>
      </p>
    </div>
  )
}

export { Login }
