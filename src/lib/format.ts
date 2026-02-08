import { formatDistanceToNow, format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: ko,
  })
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), 'yyyy.MM.dd HH:mm', { locale: ko })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}
