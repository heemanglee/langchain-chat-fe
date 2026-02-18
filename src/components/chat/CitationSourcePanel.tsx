import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { fetchDocumentDetail } from '@/api/library'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils'
import type { Anchor, LibraryCitation } from '@/types/chat'

interface CitationSourcePanelProps {
  isOpen: boolean
  citation: LibraryCitation | null
  activeAnchorId: string | null
  onSelectAnchor: (anchorId: string) => void
  onClose: () => void
}

function CitationSourcePanel({
  isOpen,
  citation,
  activeAnchorId,
  onSelectAnchor,
  onClose,
}: CitationSourcePanelProps) {
  const anchorListRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['library', 'documents', citation?.file_id, 'detail'],
    queryFn: () => fetchDocumentDetail(citation!.file_id),
    enabled: isOpen && !!citation?.file_id,
    select: (res) => res.data,
    staleTime: 30 * 1000,
  })

  const anchors = citation?.anchors ?? []
  const activeAnchor = useMemo(() => {
    if (anchors.length === 0) return null
    return anchors.find((anchor) => anchor.anchor_id === activeAnchorId) ?? anchors[0]
  }, [activeAnchorId, anchors])

  useEffect(() => {
    if (!isOpen || !citation) return

    if (activeAnchorId && citation.anchors.some((a) => a.anchor_id === activeAnchorId)) {
      return
    }

    const firstAnchor = citation.anchors[0]?.anchor_id
    if (firstAnchor) onSelectAnchor(firstAnchor)
  }, [activeAnchorId, citation, isOpen, onSelectAnchor])

  useEffect(() => {
    if (!isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!activeAnchorId || !anchorListRef.current) return
    const target = anchorListRef.current.querySelector<HTMLElement>(
      `[data-anchor-id="${activeAnchorId}"]`,
    )
    target?.scrollIntoView({ block: 'nearest' })
  }, [activeAnchorId])

  if (!isOpen || !citation) return null

  const previewUrl = data?.preview_url
  const fileName = data?.original_filename ?? citation.file_name
  const contentType = data?.content_type ?? ''
  const hasPdfPreview = contentType === 'application/pdf'
  const frameUrl =
    previewUrl && hasPdfPreview && activeAnchor?.page
      ? `${previewUrl}#page=${activeAnchor.page}`
      : previewUrl

  function renderViewer() {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (isError || !previewUrl) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <p>원본 파일을 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            다시 시도
          </button>
        </div>
      )
    }

    if (contentType.startsWith('image/')) {
      return (
        <div className="flex h-full items-center justify-center bg-zinc-50 p-3 dark:bg-zinc-950">
          <img
            src={previewUrl}
            alt={fileName}
            className="max-h-full max-w-full rounded object-contain"
          />
        </div>
      )
    }

    return (
      <iframe
        key={frameUrl}
        src={frameUrl}
        title={`${fileName} preview`}
        className="h-full w-full bg-white"
      />
    )
  }

  function renderAnchorMeta(anchor: Anchor): string {
    const meta: string[] = []
    if (anchor.page) meta.push(`p.${anchor.page}`)
    if (anchor.line_start && anchor.line_end) {
      meta.push(`L${anchor.line_start}-${anchor.line_end}`)
    } else if (anchor.line_start) {
      meta.push(`L${anchor.line_start}`)
    }
    if (meta.length > 0) return meta.join(' · ')
    return `char ${anchor.start_char}-${anchor.end_char}`
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/40 lg:static lg:z-auto lg:bg-transparent">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 lg:hidden"
        aria-label="패널 닫기"
      />

      <aside className="absolute right-0 top-0 z-10 flex h-full w-full max-w-[420px] flex-col border-l border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 lg:relative lg:w-[420px]">
        <header className="flex items-start justify-between gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {fileName}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              인용 {anchors.length}개
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="패널 닫기"
          >
            <Icon icon="solar:close-circle-linear" width={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="h-[45%] min-h-[220px] border-b border-zinc-100 dark:border-zinc-800">
            {renderViewer()}
          </div>

          <div
            ref={anchorListRef}
            className="h-[55%] overflow-y-auto px-3 py-3"
          >
            <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              참조된 텍스트
            </p>
            {anchors.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                인용 위치 정보가 없습니다.
              </div>
            ) : (
              <ul className="space-y-2">
                {anchors.map((anchor) => {
                  const isActive = anchor.anchor_id === activeAnchor?.anchor_id

                  return (
                    <li key={anchor.anchor_id}>
                      <button
                        type="button"
                        data-anchor-id={anchor.anchor_id}
                        onClick={() => onSelectAnchor(anchor.anchor_id)}
                        className={cn(
                          'w-full rounded-lg border px-2 py-2 text-left transition-colors',
                          isActive
                            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/50'
                            : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/60',
                        )}
                      >
                        <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          {renderAnchorMeta(anchor)}
                        </p>
                        <p className="mt-1 line-clamp-4 text-xs text-zinc-700 dark:text-zinc-200">
                          <mark className="rounded bg-yellow-100 px-0.5 text-inherit dark:bg-yellow-900/60">
                            {anchor.quote || '참조 텍스트 없음'}
                          </mark>
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}

export { CitationSourcePanel }
