import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'
import { ToolMessage } from './ToolMessage'
import type { Message } from '@/types/chat'

interface ChatMessageProps {
  message: Message
  onEdit?: (serverId: number, newContent: string) => void
  onRegenerate?: (serverId: number) => void
  isLastAssistant?: boolean
}

function ChatMessage({ message, onEdit, onRegenerate, isLastAssistant }: ChatMessageProps) {
  switch (message.role) {
    case 'user':
      return <UserMessage message={message} onEdit={onEdit} />
    case 'assistant':
      return (
        <AssistantMessage
          message={message}
          onRegenerate={onRegenerate}
          isLastAssistant={isLastAssistant}
        />
      )
    case 'tool':
      return <ToolMessage message={message} />
    default:
      return null
  }
}

export { ChatMessage }
