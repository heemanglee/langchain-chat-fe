import { useCallback, useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import { SidebarConversationItem } from './SidebarConversationItem'
import { useConversations } from '@/hooks/useConversations'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface SidebarConversationListProps {
  onSelectConversation?: () => void
}

function SidebarConversationList({
  onSelectConversation,
}: SidebarConversationListProps) {
  const { conversationId } = useParams<{ conversationId: string }>()
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConversations()

  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.1,
    })
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [handleIntersect])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="sm" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="px-3 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        대화 목록을 불러올 수 없습니다
      </p>
    )
  }

  const conversations = data?.conversations ?? []

  if (conversations.length === 0) {
    return (
      <p className="px-3 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        아직 대화가 없습니다
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      {conversations.map((conversation) => (
        <SidebarConversationItem
          key={conversation.conversation_id}
          conversation={conversation}
          isActive={conversation.conversation_id === conversationId}
          onSelect={onSelectConversation}
        />
      ))}
      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  )
}

export { SidebarConversationList }
