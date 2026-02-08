import { useNavigate } from 'react-router'
import { Icon } from '@iconify/react'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ConversationSummary } from '@/types/chat'

interface SidebarConversationItemProps {
  conversation: ConversationSummary
  isActive: boolean
  onSelect?: () => void
}

function SidebarConversationItem({
  conversation,
  isActive,
  onSelect,
}: SidebarConversationItemProps) {
  const navigate = useNavigate()

  function handleClick() {
    navigate(`/chat/${conversation.conversation_id}`)
    onSelect?.()
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors',
        isActive
          ? 'bg-zinc-100 dark:bg-zinc-800'
          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="flex items-center gap-2">
        <Icon
          icon="solar:chat-round-dots-linear"
          width={14}
          className="shrink-0 text-zinc-400 dark:text-zinc-500"
        />
        <span className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
          {conversation.title ?? '새 대화'}
        </span>
      </div>
      {conversation.last_message_preview && (
        <p className="truncate pl-[22px] text-xs text-zinc-500 dark:text-zinc-400">
          {conversation.last_message_preview}
        </p>
      )}
      <span className="pl-[22px] text-xs text-zinc-400 dark:text-zinc-500">
        {formatRelativeTime(conversation.updated_at)}
      </span>
    </button>
  )
}

export { SidebarConversationItem }
