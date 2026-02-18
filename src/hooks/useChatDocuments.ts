import { useQuery } from '@tanstack/react-query'
import { fetchDocuments } from '@/api/library'
import { isIndexing } from '@/lib/libraryIndexStatus'

const CHAT_DOCUMENTS_PAGE_SIZE = 100
const CHAT_DOCUMENTS_POLL_INTERVAL = 5000

function useChatDocuments() {
  return useQuery({
    queryKey: ['chat', 'documents'],
    queryFn: () =>
      fetchDocuments({
        page: 1,
        size: CHAT_DOCUMENTS_PAGE_SIZE,
        include_archived: false,
      }),
    refetchInterval: (query) => {
      const documents = query.state.data?.data?.documents
      if (!documents) return false
      return documents.some((doc) => isIndexing(doc.index_status))
        ? CHAT_DOCUMENTS_POLL_INTERVAL
        : false
    },
    select: (res) => res.data?.documents ?? [],
  })
}

export { useChatDocuments }
