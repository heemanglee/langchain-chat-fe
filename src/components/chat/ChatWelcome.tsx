import { Icon } from '@iconify/react'

function ChatWelcome() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="space-y-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
            <div className="h-4 w-4 rounded-full bg-zinc-50 dark:bg-zinc-900" />
          </div>
          <span className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            RAG.OS
          </span>
        </div>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          무엇을 도와드릴까요?
        </p>
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
          <SuggestionCard
            icon="solar:lightbulb-bolt-linear"
            text="아이디어 브레인스토밍"
          />
          <SuggestionCard
            icon="solar:file-text-bold"
            text="문서 요약하기"
          />
          <SuggestionCard
            icon="solar:code-square-linear"
            text="코드 설명하기"
          />
          <SuggestionCard
            icon="solar:magnifer-linear"
            text="정보 검색하기"
          />
        </div>
      </div>
    </div>
  )
}

function SuggestionCard({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-200 p-3 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50">
      <Icon icon={icon} width={18} className="shrink-0" />
      <span>{text}</span>
    </div>
  )
}

export { ChatWelcome }
