import { useQuery } from '@tanstack/react-query'
import { fetchConversationMessages } from '@/api/chat'
import { mapServerMessage } from '@/lib/messageMapper'
import type { ToolState } from '@/types/chat'
import type { Message } from '@/types/chat'

interface ConversationMessagesResult {
  messages: Message[]
  toolState: ToolState | null
}

function useConversationMessages(conversationId?: string) {
  return useQuery({
    queryKey: ['conversations', conversationId, 'messages'],
    queryFn: () => fetchConversationMessages(conversationId!),
    enabled: !!conversationId,
    select: (data): ConversationMessagesResult => ({
      messages: data.data?.messages.map(mapServerMessage) ?? [],
      toolState: data.data?.tool_state ?? null,
    }),
  })
}

export { useConversationMessages }
export type { ConversationMessagesResult }
