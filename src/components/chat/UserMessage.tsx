import { useState, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { MessageEditForm } from './MessageEditForm'
import { MessageImages } from './MessageImages'
import type { Message } from '@/types/chat'

interface UserMessageProps {
  message: Message
  onEdit?: (serverId: number, newContent: string) => void
}

function UserMessage({ message, onEdit }: UserMessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const canEdit = message.serverId !== null && !!onEdit

  const handleSave = useCallback(
    (newContent: string) => {
      if (!message.serverId || !onEdit) return
      setIsEditing(false)
      onEdit(message.serverId, newContent)
    },
    [message.serverId, onEdit],
  )

  if (isEditing) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[80%]">
          <MessageEditForm
            initialContent={message.content}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
          <Icon
            icon="solar:user-circle-linear"
            width={20}
            className="text-zinc-600 dark:text-zinc-300"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="group flex justify-end gap-3">
      <div className="max-w-[80%]">
        <div className="rounded-2xl rounded-tr-sm bg-zinc-900 px-4 py-2.5 text-sm text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
          {message.content}
        </div>
        {message.images && message.images.length > 0 && (
          <MessageImages images={message.images} />
        )}
        {canEdit && (
          <div className="mt-1 flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="메시지 수정"
            >
              <Icon icon="solar:pen-linear" width={14} />
            </button>
          </div>
        )}
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
        <Icon
          icon="solar:user-circle-linear"
          width={20}
          className="text-zinc-600 dark:text-zinc-300"
        />
      </div>
    </div>
  )
}

export { UserMessage }
