import { Icon } from '@iconify/react'
import { MarkdownRenderer } from './MarkdownRenderer'
import { SourcesList } from './SourcesList'
import type { Message } from '@/types/chat'

interface ChatMessageProps {
  message: Message
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
          <div className="h-3 w-3 rounded-full bg-zinc-50 dark:bg-zinc-900" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        {isUser ? (
          <div className="rounded-2xl rounded-tr-sm bg-zinc-900 px-4 py-2.5 text-sm text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
            {message.content}
          </div>
        ) : (
          <div className="text-sm">
            <MarkdownRenderer content={message.content} />
            {message.isStreaming && (
              <span className="inline-block h-4 w-1.5 animate-pulse rounded-sm bg-zinc-400 dark:bg-zinc-500" />
            )}
            {message.sources && message.sources.length > 0 && (
              <SourcesList sources={message.sources} />
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
          <Icon
            icon="solar:user-circle-linear"
            width={20}
            className="text-zinc-600 dark:text-zinc-300"
          />
        </div>
      )}
    </div>
  )
}

export { ChatMessage }
