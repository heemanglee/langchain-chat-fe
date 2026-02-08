import { Icon } from '@iconify/react'

interface ToolUsageSummaryProps {
  tools: string[]
}

const TOOL_ICON_MAP: Record<string, string> = {
  web_search: 'solar:global-linear',
}

const DEFAULT_TOOL_ICON = 'solar:settings-linear'

function ToolUsageSummary({ tools }: ToolUsageSummaryProps) {
  if (tools.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tools.map((tool) => (
        <span
          key={tool}
          className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        >
          <Icon
            icon={TOOL_ICON_MAP[tool] ?? DEFAULT_TOOL_ICON}
            width={12}
          />
          {tool}
        </span>
      ))}
    </div>
  )
}

export { ToolUsageSummary }
