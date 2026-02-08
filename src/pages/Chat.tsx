import { useParams } from 'react-router'
import { ChatWelcome } from '@/components/chat/ChatWelcome'
import { ChatMessageList } from '@/components/chat/ChatMessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { useChat } from '@/hooks/useChat'
import { useConversationMessages } from '@/hooks/useConversationMessages'

function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { data: historyMessages, isLoading: isHistoryLoading } =
    useConversationMessages(conversationId)

  const {
    messages,
    isStreaming,
    isLoading,
    toolCall,
    sendMessage,
    editMessage,
    regenerateMessage,
    stopStreaming,
  } = useChat({
    conversationId,
    initialMessages: historyMessages,
    isHistoryLoading,
  })

  const isEmpty = messages.length === 0 && !isLoading

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {isEmpty ? (
        <ChatWelcome />
      ) : (
        <ChatMessageList
          messages={messages}
          toolCall={toolCall}
          isLoading={isLoading}
          onEdit={editMessage}
          onRegenerate={regenerateMessage}
        />
      )}
      <ChatInput
        onSend={sendMessage}
        isStreaming={isStreaming}
        onStop={stopStreaming}
      />
    </div>
  )
}

export { Chat }
