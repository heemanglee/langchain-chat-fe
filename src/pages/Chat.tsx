function Chat() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
            <div className="h-3 w-3 rounded-full bg-zinc-50 dark:bg-zinc-900" />
          </div>
          <span className="text-xl font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
            RAG.OS
          </span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          무엇을 도와드릴까요?
        </p>
        <div className="rounded-lg border border-dashed border-zinc-300 px-12 py-6 text-sm text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
          Phase 3에서 채팅 UI 구현 예정
        </div>
      </div>
    </div>
  )
}

export { Chat }
