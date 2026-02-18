import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { ChatWelcome } from '@/components/chat/ChatWelcome'
import { ChatMessageList } from '@/components/chat/ChatMessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { CitationSourcePanel } from '@/components/chat/CitationSourcePanel'
import { useChat } from '@/hooks/useChat'
import { useChatDocuments } from '@/hooks/useChatDocuments'
import { useConversationMessages } from '@/hooks/useConversationMessages'
import { useReindexDocument } from '@/hooks/useLibraryMutations'
import { useLibraryStore } from '@/stores/libraryStore'
import { useChatToolStore } from '@/stores/chatToolStore'
import type { LibraryCitation } from '@/types/chat'

function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const librarySelectedIds = useLibraryStore((s) => s.selectedIds)
  const clearLibrarySelection = useLibraryStore((s) => s.clearSelection)
  const hydratedLibrarySelectionRef = useRef(false)
  const prevConversationIdRef = useRef<string | undefined>(conversationId)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<number[]>(
    () => Array.from(librarySelectedIds),
  )
  const [activeCitation, setActiveCitation] = useState<LibraryCitation | null>(null)
  const [activeCitationId, setActiveCitationId] = useState<string | null>(null)
  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(null)
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false)

  const { data: conversationData, isLoading: isHistoryLoading } =
    useConversationMessages(conversationId)
  const historyMessages = conversationData?.messages
  const serverToolState = conversationData?.toolState
  const { data: documents = [], isLoading: isDocumentsLoading } = useChatDocuments()
  const reindexDocument = useReindexDocument()

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

  useEffect(() => {
    if (hydratedLibrarySelectionRef.current) return
    if (librarySelectedIds.size === 0) return

    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate library selection once on mount
    setSelectedDocumentIds((prev) => {
      if (prev.length > 0) return prev
      return Array.from(librarySelectedIds)
    })
    clearLibrarySelection()
    hydratedLibrarySelectionRef.current = true
  }, [clearLibrarySelection, librarySelectedIds])

  useEffect(() => {
    const prevConversationId = prevConversationIdRef.current
    if (prevConversationId !== undefined && prevConversationId !== conversationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on conversation change
      setSelectedDocumentIds([])
      setActiveCitation(null)
      setActiveCitationId(null)
      setActiveAnchorId(null)
      setIsSourcePanelOpen(false)
    }
    prevConversationIdRef.current = conversationId
  }, [conversationId])

  useEffect(() => {
    if (!serverToolState) return
    if (!conversationId) return

    useChatToolStore.getState().hydrate(
      serverToolState.use_web_search,
      serverToolState.selected_document_ids,
    )

    if (serverToolState.selected_document_ids.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from server
      setSelectedDocumentIds(serverToolState.selected_document_ids)
    }
  }, [conversationId, serverToolState])

  function handleOpenLibraryCitation(citation: LibraryCitation, anchorId?: string) {
    setActiveCitation(citation)
    setActiveCitationId(citation.citation_id)
    setActiveAnchorId(anchorId ?? citation.anchors[0]?.anchor_id ?? null)
    setIsSourcePanelOpen(true)
  }

  const isEmpty = messages.length === 0 && !isLoading

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {isEmpty ? (
          <ChatWelcome />
        ) : (
          <ChatMessageList
            messages={messages}
            toolCall={toolCall}
            isLoading={isLoading}
            onEdit={editMessage}
            onRegenerate={regenerateMessage}
            activeCitationId={activeCitationId}
            onOpenLibraryCitation={handleOpenLibraryCitation}
          />
        )}
        <ChatInput
          onSend={sendMessage}
          isStreaming={isStreaming}
          onStop={stopStreaming}
          documents={documents}
          isDocumentsLoading={isDocumentsLoading}
          selectedDocumentIds={selectedDocumentIds}
          onSelectedDocumentIdsChange={setSelectedDocumentIds}
          onReindexDocument={(documentId) => reindexDocument.mutate(documentId)}
        />
      </div>

      <CitationSourcePanel
        isOpen={isSourcePanelOpen}
        citation={activeCitation}
        activeAnchorId={activeAnchorId}
        onSelectAnchor={setActiveAnchorId}
        onClose={() => setIsSourcePanelOpen(false)}
      />
    </div>
  )
}

export { Chat }
