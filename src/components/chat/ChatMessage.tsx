import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'
import type { LibraryCitation, Message } from '@/types/chat'

interface ChatMessageProps {
  message: Message
  usedTools?: string[]
  onEdit?: (serverId: number, newContent: string) => void
  onRegenerate?: (serverId: number) => void
  isLastAssistant?: boolean
  activeCitationId?: string | null
  onOpenLibraryCitation?: (
    citation: LibraryCitation,
    anchorId?: string,
  ) => void
}

function ChatMessage({
  message,
  usedTools,
  onEdit,
  onRegenerate,
  isLastAssistant,
  activeCitationId,
  onOpenLibraryCitation,
}: ChatMessageProps) {
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
          activeCitationId={activeCitationId}
          onOpenLibraryCitation={onOpenLibraryCitation}
        />
      )
    default:
      return null
  }
}

export { ChatMessage }
