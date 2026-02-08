import { Icon } from '@iconify/react'
import type { Message } from '@/types/chat'

interface ToolMessageProps {
  message: Message
}

function ToolMessage({ message }: ToolMessageProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      <Icon icon="solar:check-circle-bold" width={14} className="shrink-0" />
      <span className="truncate">
        {message.toolName ?? 'tool'} 완료
      </span>
    </div>
  )
}

export { ToolMessage }
