import { Icon } from '@iconify/react'

const features = [
  {
    icon: 'solar:folder-check-linear',
    bgIcon: 'solar:folder-with-files-bold',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10',
    title: '스마트 세션 디렉토리',
    description:
      '주제별로 세션을 담을 폴더를 직접 만들거나, 질문 내용에 따라 AI가 가장 적합한 디렉토리를 자동으로 추천하여 정리합니다.',
  },
  {
    icon: 'solar:file-smile-linear',
    bgIcon: 'solar:file-text-bold',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    title: '폭넓은 문서 호환성',
    description:
      '형식에 구애받지 마세요. PDF, DOCX, TXT, MD 등 다양한 포맷을 완벽하게 지원하며 텍스트를 추출합니다.',
  },
  {
    icon: 'solar:users-group-two-rounded-linear',
    bgIcon: 'solar:robot-bold',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    title: '커스텀 에이전트 빌더',
    description:
      '특정 목적을 가진 에이전트를 직접 생성하거나, 업로드된 문서를 기반으로 즉시 생성된 에이전트를 활용하세요.',
  },
] as const

function FeaturesSection() {
  return (
    <section
      id="features"
      className="flex h-screen w-full snap-start items-center justify-center border-t border-black/5 bg-zinc-50 px-6 dark:border-white/5 dark:bg-zinc-950"
    >
      <div className="w-full max-w-6xl">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-zinc-950 md:text-4xl dark:text-zinc-50">
            강력한 분류 및 확장성
          </h2>
          <p className="font-light text-zinc-600 dark:text-zinc-400">
            다양한 포맷을 지원하고, 스스로 정리하는 똑똑한 작업 공간.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  bgIcon,
  color,
  bgColor,
  title,
  description,
}: (typeof features)[number]) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-zinc-100/40 p-8 transition-all duration-300 hover:border-black/10 hover:bg-zinc-100/60 dark:border-white/5 dark:bg-zinc-800/40 dark:hover:border-white/10 dark:hover:bg-zinc-800/60">
      {/* Background icon */}
      <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
        <Icon icon={bgIcon} width={100} />
      </div>

      <div
        className={`mb-6 flex h-10 w-10 items-center justify-center rounded-lg ${bgColor} ${color} transition-transform group-hover:scale-110`}
      >
        <Icon icon={icon} width={24} />
      </div>

      <h3 className="mb-3 text-xl font-medium tracking-tight text-black dark:text-white">
        {title}
      </h3>

      <p className="text-sm leading-relaxed font-light text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  )
}

export { FeaturesSection }
