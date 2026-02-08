import { useQuery } from '@tanstack/react-query'
import { fetchConversationMessages } from '@/api/chat'
import { mapServerMessage } from '@/lib/messageMapper'

function useConversationMessages(conversationId?: string) {
  return useQuery({
    queryKey: ['conversations', conversationId, 'messages'],
    queryFn: () => fetchConversationMessages(conversationId!),
    enabled: !!conversationId,
    select: (data) => data.data?.messages.map(mapServerMessage) ?? [],
  })
}

export { useConversationMessages }
