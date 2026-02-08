import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'
import type { Message } from '@/types/chat'

interface ChatMessageProps {
  message: Message
  usedTools?: string[]
  onEdit?: (serverId: number, newContent: string) => void
  onRegenerate?: (serverId: number) => void
  isLastAssistant?: boolean
}

function ChatMessage({ message, usedTools, onEdit, onRegenerate, isLastAssistant }: ChatMessageProps) {
  switch (message.role) {
    case 'user':
      return <UserMessage message={message} onEdit={onEdit} />
    case 'assistant':
      return (
        <AssistantMessage
          message={message}
          usedTools={usedTools}
          onRegenerate={onRegenerate}
          isLastAssistant={isLastAssistant}
        />
      )
    default:
      return null
  }
}

export { ChatMessage }
