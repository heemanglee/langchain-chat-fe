import { Icon } from '@iconify/react'
import { MarkdownRenderer } from './MarkdownRenderer'
import { SourcesList } from './SourcesList'
import { ToolUsageSummary } from './ToolUsageSummary'
import type { LibraryCitation, Message } from '@/types/chat'

interface AssistantMessageProps {
  message: Message
  usedTools?: string[]
  isLastAssistant?: boolean
  onRegenerate?: (serverId: number) => void
  activeCitationId?: string | null
  onOpenLibraryCitation?: (
    citation: LibraryCitation,
    anchorId?: string,
  ) => void
}

function extractCitationNumber(value: string): string | null {
  const matched = value.match(/(\d+)$/)
  return matched ? matched[1] : null
}

function resolveLibraryCitation(
  sources: Message['sources'] | undefined,
  citationRef: string,
): LibraryCitation | null {
  if (!sources || sources.length === 0) return null

  const librarySources = sources.filter(
    (item): item is LibraryCitation => item.source_type === 'library',
  )
  if (librarySources.length === 0) return null

  const normalizedRef = citationRef.toLowerCase()
  const exactMatch = librarySources.find(
    (source) => source.citation_id.toLowerCase() === normalizedRef,
  )
  if (exactMatch) return exactMatch

  const refNumber = extractCitationNumber(normalizedRef)
  if (!refNumber) return null

  const suffixMatch = librarySources.find(
    (source) =>
      extractCitationNumber(source.citation_id.toLowerCase()) === refNumber,
  )
  if (suffixMatch) return suffixMatch

  const ordinalIndex = Number(refNumber) - 1
  if (ordinalIndex >= 0 && ordinalIndex < librarySources.length) {
    return librarySources[ordinalIndex]
  }

  return librarySources[0] ?? null
}

function AssistantMessage({
  message,
  usedTools = [],
  isLastAssistant = false,
  onRegenerate,
  activeCitationId = null,
  onOpenLibraryCitation,
}: AssistantMessageProps) {
  const canRegenerate =
    isLastAssistant &&
    message.serverId !== null &&
    !message.isStreaming &&
    !!onRegenerate

  function handleCitationClick(citationRef: string) {
    const source = resolveLibraryCitation(message.sources, citationRef)
    if (!source) return
    onOpenLibraryCitation?.(source, source.anchors[0]?.anchor_id)
  }

  return (
    <div className="group flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
        <div className="h-3 w-3 rounded-full bg-zinc-50 dark:bg-zinc-900" />
      </div>

      <div className="max-w-[80%]">
        <div className="text-sm">
          <MarkdownRenderer
            content={message.content}
            onCitationClick={handleCitationClick}
          />
          {message.isStreaming && (
            <span className="inline-block h-4 w-1.5 animate-pulse rounded-sm bg-zinc-400 dark:bg-zinc-500" />
          )}
          {message.sources && message.sources.length > 0 && (
            <SourcesList
              sources={message.sources}
              activeCitationId={activeCitationId}
              onOpenLibraryCitation={onOpenLibraryCitation}
            />
          )}
        </div>

        {usedTools.length > 0 && !message.isStreaming && (
          <ToolUsageSummary tools={usedTools} />
        )}

        {canRegenerate && (
          <div className="mt-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onRegenerate(message.serverId!)}
              className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="응답 재생성"
            >
              <Icon icon="solar:refresh-circle-linear" width={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export { AssistantMessage }
