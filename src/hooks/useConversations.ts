import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchConversations } from '@/api/chat'
import { CONVERSATION_PAGE_SIZE } from '@/lib/constants'

function useConversations() {
  return useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: ({ pageParam }) =>
      fetchConversations({
        cursor: pageParam ?? undefined,
        limit: CONVERSATION_PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (!lastPage.data?.has_next) return undefined
      return lastPage.data.next_cursor
    },
    select: (data) => ({
      conversations: data.pages.flatMap(
        (page) => page.data?.conversations ?? [],
      ),
      hasNextPage: data.pages.at(-1)?.data?.has_next ?? false,
    }),
  })
}

export { useConversations }
