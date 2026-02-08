import { Link } from 'react-router'

function Register() {
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

      {/* Phase 2에서 폼 구현 */}
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
          Phase 2에서 구현 예정
        </div>
      </div>

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
