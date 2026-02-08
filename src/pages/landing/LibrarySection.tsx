import { Icon } from '@iconify/react'

function LibrarySection() {
  return (
    <section className="flex h-screen w-full snap-start items-center justify-center border-t border-black/5 bg-zinc-50 px-6 dark:border-white/5 dark:bg-zinc-950">
      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Left: text */}
        <div className="order-2 space-y-8 lg:order-1">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-black/10 bg-zinc-100 text-black dark:border-white/10 dark:bg-zinc-800 dark:text-white">
            <Icon icon="solar:library-linear" width={24} />
          </div>

          <h2 className="text-3xl font-medium tracking-tight text-black md:text-5xl dark:text-white">
            지식은 보관하고,
            <br />
            에이전트는 생성합니다.
          </h2>

          <p className="text-base leading-relaxed font-light text-zinc-600 md:text-lg dark:text-zinc-400">
            문서를 한 번만 업로드하면 영구적으로 재사용 가능한{' '}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              라이브러리
            </strong>
            가 구축됩니다. 파일을 올리는 순간, 해당 지식을 학습한{' '}
            <strong className="font-medium text-zinc-800 dark:text-zinc-200">
              전용 에이전트
            </strong>
            가 즉시 생성됩니다.
          </p>

          <div className="space-y-4 pt-4">
            <FeatureItem
              icon="solar:check-circle-bold"
              iconColor="text-emerald-600 dark:text-emerald-400"
              bgColor="bg-emerald-100 dark:bg-emerald-900/40"
              title="문서 라이브러리"
              description="업로드된 문서는 중앙 라이브러리에 저장되어, 언제든 다른 세션에서 다시 불러와 사용할 수 있습니다."
            />
            <FeatureItem
              icon="solar:magic-stick-3-bold"
              iconColor="text-blue-600 dark:text-blue-400"
              bgColor="bg-blue-100 dark:bg-blue-900/40"
              title="자동 에이전트 빌더"
              description="사용자가 직접 생성하거나, 파일 업로드 시 자동으로 생성된 에이전트와 대화하세요."
            />
          </div>
        </div>

        {/* Right: dashboard mockup */}
        <div className="group relative order-1 lg:order-2">
          {/* Glow effect */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-blue-400 opacity-20 blur transition duration-1000 group-hover:opacity-30 group-hover:duration-200" />

          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}

function FeatureItem({
  icon,
  iconColor,
  bgColor,
  title,
  description,
}: {
  icon: string
  iconColor: string
  bgColor: string
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${bgColor}`}
      >
        <Icon icon={icon} width={14} className={iconColor} />
      </div>
      <div>
        <h4 className="text-sm font-medium text-black dark:text-white">
          {title}
        </h4>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="relative flex aspect-[4/3] overflow-hidden rounded-xl border border-black/10 bg-zinc-50 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
      {/* Sidebar */}
      <div className="flex w-1/3 flex-col gap-2 border-r border-black/5 bg-zinc-100/50 p-4 dark:border-white/5 dark:bg-zinc-800/50">
        <div className="mb-2 px-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
          Library
        </div>
        <div className="flex items-center gap-2 rounded-md border border-black/5 bg-white px-3 py-2 text-xs font-medium shadow-sm dark:border-white/5 dark:bg-zinc-700">
          <Icon
            icon="solar:folder-with-files-linear"
            className="text-emerald-500"
          />
          <span className="text-zinc-800 dark:text-zinc-200">모든 문서</span>
        </div>
        <div className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700">
          <Icon icon="solar:clock-circle-linear" />
          최근 업로드
        </div>

        <div className="mt-4 mb-2 px-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
          Agents
        </div>
        <div className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700">
          <Icon icon="solar:user-circle-linear" className="text-blue-500" />
          마케팅 분석 봇
        </div>
        <div className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700">
          <Icon
            icon="solar:document-text-linear"
            className="text-purple-500"
          />
          계약서 검토 봇
        </div>
      </div>

      {/* Main content */}
      <div className="w-2/3 bg-zinc-50 p-6 dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            최근 업로드 파일
          </h3>
          <button className="flex items-center gap-1 rounded-full bg-black px-3 py-1.5 text-[10px] text-white dark:bg-white dark:text-black">
            <Icon icon="solar:add-circle-linear" />
            업로드
          </button>
        </div>

        <div className="space-y-3">
          {/* File 1 */}
          <div className="group/file flex cursor-pointer items-center justify-between rounded-lg border border-black/5 bg-white p-3 transition-all hover:border-emerald-500/30 dark:border-white/5 dark:bg-zinc-800 dark:hover:border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400">
                <Icon icon="solar:file-text-bold" width={16} />
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  Q4_Result.pdf
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  PDF &bull; 2.4 MB
                </div>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              에이전트 생성됨
            </span>
          </div>

          {/* File 2 */}
          <div className="group/file flex cursor-pointer items-center justify-between rounded-lg border border-black/5 bg-white p-3 transition-all hover:border-blue-500/30 dark:border-white/5 dark:bg-zinc-800 dark:hover:border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
                <Icon icon="solar:file-text-bold" width={16} />
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  Tech_Spec.docx
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  DOCX &bull; 1.1 MB
                </div>
              </div>
            </div>
            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              처리 중...
            </span>
          </div>
        </div>

        {/* Suggestion toast */}
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 dark:border-yellow-800/50 dark:bg-yellow-900/20">
          <Icon
            icon="solar:lightbulb-bolt-linear"
            className="mt-0.5 text-yellow-600 dark:text-yellow-400"
            width={14}
          />
          <div className="text-xs text-yellow-800 dark:text-yellow-200">
            <span className="font-semibold">제안:</span>{' '}
            &apos;Q4_Result.pdf&apos; 파일은{' '}
            <span className="underline decoration-dashed">재무 리포트</span>{' '}
            디렉토리에 추가하시겠습니까?
          </div>
        </div>
      </div>
    </div>
  )
}

export { LibrarySection }
