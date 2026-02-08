import { Link } from 'react-router'
import { Icon } from '@iconify/react'

function HeroSection() {
  return (
    <section className="relative flex h-screen w-full snap-start flex-col items-center justify-center px-6">
      {/* Subtle glow background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.08),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.15),transparent)]" />

      <div className="relative mt-16 w-full max-w-4xl space-y-8 text-center">
        {/* Status badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-zinc-700 dark:text-zinc-300">
            스마트 세션 디렉토리 기능 추가
          </span>
        </div>

        {/* Headline */}
        <h1 className="bg-gradient-to-b from-black via-black to-zinc-500 bg-clip-text text-5xl leading-[1.1] font-medium tracking-tight text-transparent md:text-7xl dark:from-white dark:via-white dark:to-zinc-500">
          당신의 문서를 위한
          <br />
          지능형 에이전트
        </h1>

        {/* Description */}
        <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-zinc-600 md:text-xl dark:text-zinc-400">
          PDF, DOCX, MD 파일을 업로드하세요.{' '}
          <br className="hidden sm:block" />
          자동으로 생성된 AI 에이전트가 문맥을 파악하고 분류하여 답변합니다.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Link
            to="/register"
            className="flex h-12 cursor-pointer items-center gap-2 rounded-full bg-black px-8 text-sm font-medium text-zinc-50 shadow-[0_0_20px_-5px_rgba(0,0,0,0.2)] transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] dark:hover:bg-zinc-200"
          >
            문서 업로드하기
            <Icon icon="solar:upload-minimalistic-linear" width={18} />
          </Link>
          <button className="flex h-12 cursor-pointer items-center gap-2 rounded-full border border-zinc-300 px-8 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/5 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-white/5">
            데모 영상 보기
            <Icon icon="solar:play-circle-linear" width={18} />
          </button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 z-10 h-32 w-full bg-gradient-to-t from-zinc-50 to-transparent dark:from-zinc-950" />
    </section>
  )
}

export { HeroSection }
