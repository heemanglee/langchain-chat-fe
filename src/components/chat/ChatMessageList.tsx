import { useMemo } from 'react'
import { ChatMessage } from './ChatMessage'
import { ToolCallIndicator } from './ToolCallIndicator'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import type { Message } from '@/types/chat'
import type { ToolCallState } from '@/hooks/useChat'

interface ChatMessageListProps {
  messages: Message[]
  toolCall: ToolCallState | null
  isLoading?: boolean
  onEdit?: (serverId: number, newContent: string) => void
  onRegenerate?: (serverId: number) => void
}

function ChatMessageList({
  messages,
  toolCall,
  isLoading = false,
  onEdit,
  onRegenerate,
}: ChatMessageListProps) {
  const { containerRef, handleScroll } = useAutoScroll([messages, toolCall])

  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i].id
    }
    return null
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner size="lg" className="text-zinc-400" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-6"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
            isLastAssistant={message.id === lastAssistantId}
          />
        ))}
        {toolCall && (
          <ToolCallIndicator name={toolCall.name} status={toolCall.status} />
        )}
      </div>
    </div>
  )
}

export { ChatMessageList }
