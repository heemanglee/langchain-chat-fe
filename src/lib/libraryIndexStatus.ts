import type { LibraryIndexStatus } from '@/types/library'

type NormalizedIndexStatus = Exclude<LibraryIndexStatus, null>

function normalizeIndexStatus(
  status: LibraryIndexStatus | null | undefined,
): NormalizedIndexStatus {
  return status ?? 'pending'
}

function isIndexing(status: LibraryIndexStatus | null | undefined): boolean {
  const normalized = normalizeIndexStatus(status)
  return normalized === 'pending' || normalized === 'processing'
}

function isReadyForSelection(
  status: LibraryIndexStatus | null | undefined,
): boolean {
  return normalizeIndexStatus(status) === 'ready'
}

function getIndexStatusLabel(
  status: LibraryIndexStatus | null | undefined,
): string {
  switch (normalizeIndexStatus(status)) {
    case 'pending':
      return '대기 중'
    case 'processing':
      return '인덱싱 중'
    case 'ready':
      return '검색 가능'
    case 'skipped':
      return '텍스트 없음'
    case 'failed':
      return '인덱싱 실패'
  }
}

export {
  normalizeIndexStatus,
  isIndexing,
  isReadyForSelection,
  getIndexStatusLabel,
}
export type { NormalizedIndexStatus }
