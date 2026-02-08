import { Icon } from '@iconify/react'
import type { ToolCallInfo } from '@/types/chat'

interface ToolCallBadgeProps {
  toolCall: ToolCallInfo
}

function ToolCallBadge({ toolCall }: ToolCallBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400">
      <Icon icon="solar:settings-linear" width={12} />
      {toolCall.name}
    </span>
  )
}

export { ToolCallBadge }
