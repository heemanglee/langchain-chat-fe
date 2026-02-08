import { Icon } from '@iconify/react'

interface ToolCallIndicatorProps {
  name: string
  status: 'calling' | 'done'
}

function ToolCallIndicator({ name, status }: ToolCallIndicatorProps) {
  const isCalling = status === 'calling'

  return (
    <div className="my-2 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 dark:bg-blue-950 dark:text-blue-400">
      {isCalling ? (
        <Icon icon="solar:refresh-circle-linear" width={16} className="animate-spin" />
      ) : (
        <Icon icon="solar:check-circle-bold" width={16} />
      )}
      <span>
        {isCalling ? `${name} 실행 중...` : `${name} 완료`}
      </span>
    </div>
  )
}

export { ToolCallIndicator }
