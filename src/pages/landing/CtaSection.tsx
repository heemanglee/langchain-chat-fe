import { Link } from 'react-router'
import { Icon } from '@iconify/react'

function CtaSection() {
  return (
    <section className="relative flex h-screen w-full snap-start items-center justify-center overflow-hidden border-t border-black/5 bg-zinc-50 px-6 dark:border-white/5 dark:bg-zinc-950">
      {/* Background radial */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/5 blur-[100px] dark:bg-white/5" />

      <div className="relative z-10 w-full max-w-2xl space-y-10 text-center">
        <h2 className="text-4xl font-medium tracking-tight text-black md:text-6xl dark:text-white">
          지금 바로
          <br />
          나만의 지식 베이스를.
        </h2>

        <p className="text-lg font-light text-zinc-600 dark:text-zinc-400">
          문서를 업로드하고 1분 안에 첫 번째 에이전트와 대화를 시작해보세요.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link
            to="/register"
            className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-black text-base font-medium text-zinc-50 transition-transform hover:scale-105 sm:w-auto sm:px-10 dark:bg-white dark:text-zinc-900"
          >
            무료로 시작하기
            <Icon icon="solar:arrow-right-linear" width={20} />
          </Link>
          <div className="flex items-center gap-2 text-xs font-light text-zinc-400 dark:text-zinc-500">
            <Icon icon="solar:shield-check-linear" />
            <span>SOC2 보안 인증 서버 저장</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 flex w-full max-w-7xl flex-col items-center justify-between border-t border-black/5 px-6 pt-6 text-xs text-zinc-400 md:flex-row dark:border-white/5 dark:text-zinc-500">
        <div>&copy; 2024 RAG.OS Inc. All rights reserved.</div>
        <div className="mt-4 flex gap-6 md:mt-0">
          <a
            href="#"
            className="cursor-pointer transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Twitter
          </a>
          <a
            href="#"
            className="cursor-pointer transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            GitHub
          </a>
          <a
            href="#"
            className="cursor-pointer transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Discord
          </a>
        </div>
      </footer>
    </section>
  )
}

export { CtaSection }
