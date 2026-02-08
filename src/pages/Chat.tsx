import { useParams } from 'react-router'
import { ChatWelcome } from '@/components/chat/ChatWelcome'
import { ChatMessageList } from '@/components/chat/ChatMessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { useChat } from '@/hooks/useChat'

function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { messages, isStreaming, toolCall, sendMessage, stopStreaming } =
    useChat(conversationId)

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {isEmpty ? (
        <ChatWelcome />
      ) : (
        <ChatMessageList messages={messages} toolCall={toolCall} />
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
