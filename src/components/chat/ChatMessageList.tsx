import { ChatMessage } from './ChatMessage'
import { ToolCallIndicator } from './ToolCallIndicator'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import type { Message } from '@/types/chat'
import type { ToolCallState } from '@/hooks/useChat'

interface ChatMessageListProps {
  messages: Message[]
  toolCall: ToolCallState | null
}

function ChatMessageList({ messages, toolCall }: ChatMessageListProps) {
  const { containerRef, handleScroll } = useAutoScroll([messages, toolCall])

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-6"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {toolCall && (
          <ToolCallIndicator name={toolCall.name} status={toolCall.status} />
        )}
      </div>
    </div>
  )
}

export { ChatMessageList }
