import { Link } from 'react-router'
import { Icon } from '@iconify/react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useAuthStore } from '@/stores/authStore'

function LandingNavbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-black/5 bg-zinc-50/80 px-6 py-4 backdrop-blur-md dark:border-white/5 dark:bg-zinc-950/80">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black dark:bg-white">
          <div className="h-2 w-2 rounded-full bg-zinc-50 dark:bg-zinc-900" />
        </div>
        <span className="text-sm font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
          RAG.OS
        </span>
      </div>

      <div className="hidden items-center gap-8 text-xs font-medium text-zinc-600 md:flex dark:text-zinc-400">
        <a
          href="#features"
          className="cursor-pointer transition-colors hover:text-black dark:hover:text-white"
        >
          라이브러리
        </a>
        <a
          href="#features"
          className="cursor-pointer transition-colors hover:text-black dark:hover:text-white"
        >
          에이전트 빌더
        </a>
        <a
          href="#"
          className="cursor-pointer transition-colors hover:text-black dark:hover:text-white"
        >
          API 문서
        </a>
        <a
          href="#"
          className="cursor-pointer transition-colors hover:text-black dark:hover:text-white"
        >
          요금제
        </a>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {isAuthenticated ? (
          <Link
            to="/chat"
            className="flex cursor-pointer items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span>대시보드</span>
            <Icon icon="solar:arrow-right-linear" width={14} />
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="hidden cursor-pointer text-xs text-zinc-600 transition-colors hover:text-black sm:block dark:text-zinc-400 dark:hover:text-white"
            >
              로그인
            </Link>
            <Link
              to="/register"
              className="flex cursor-pointer items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <span>시작하기</span>
              <Icon icon="solar:arrow-right-linear" width={14} />
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export { LandingNavbar }
