import { useMemo } from 'react'
import { ChatMessage } from './ChatMessage'
import { ToolCallIndicator } from './ToolCallIndicator'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import type { Message } from '@/types/chat'
import type { ToolCallState } from '@/hooks/useChat'

interface ChatMessageListProps {
  messages: Message[]
  toolCall: ToolCallState | null
  isLoading?: boolean
  onEdit?: (serverId: number, newContent: string) => void
  onRegenerate?: (serverId: number) => void
}

function isVisibleMessage(msg: Message): boolean {
  if (msg.role === 'tool') return false
  if (msg.role === 'assistant' && !msg.content.trim() && !msg.isStreaming) {
    return false
  }
  return true
}

function collectUsedTools(messages: Message[]): Map<string, string[]> {
  const result = new Map<string, string[]>()

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (msg.role !== 'assistant') continue
    if (!msg.content.trim() && !msg.isStreaming) continue

    const tools = new Set<string>()

    if (msg.toolCalls) {
      for (const tc of msg.toolCalls) tools.add(tc.name)
    }

    for (let j = i - 1; j >= 0; j--) {
      const prev = messages[j]
      if (prev.role === 'user') break
      if (prev.role === 'tool' && prev.toolName) tools.add(prev.toolName)
      if (prev.role === 'assistant' && prev.toolCalls) {
        for (const tc of prev.toolCalls) tools.add(tc.name)
      }
    }

    if (tools.size > 0) {
      result.set(msg.id, Array.from(tools))
    }
  }

  return result
}

function ChatMessageList({
  messages,
  toolCall,
  isLoading = false,
  onEdit,
  onRegenerate,
}: ChatMessageListProps) {
  const { containerRef, handleScroll } = useAutoScroll([messages, toolCall])

  const displayMessages = useMemo(
    () => messages.filter(isVisibleMessage),
    [messages],
  )

  const usedToolsMap = useMemo(() => collectUsedTools(messages), [messages])

  const lastAssistantId = useMemo(() => {
    for (let i = displayMessages.length - 1; i >= 0; i--) {
      if (displayMessages[i].role === 'assistant') return displayMessages[i].id
    }
    return null
  }, [displayMessages])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner size="lg" className="text-zinc-400" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-6"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {displayMessages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            usedTools={usedToolsMap.get(message.id)}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
            isLastAssistant={message.id === lastAssistantId}
          />
        ))}
        {toolCall && (
          <ToolCallIndicator name={toolCall.name} status={toolCall.status} />
        )}
      </div>
    </div>
  )
}

export { ChatMessageList }
