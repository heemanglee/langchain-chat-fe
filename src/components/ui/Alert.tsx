import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type AlertVariant = 'error' | 'success' | 'info'

interface AlertProps {
  variant: AlertVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<AlertVariant, string> = {
  error: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
  success:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  info: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
}

function Alert({ variant, children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg px-4 py-3 text-sm',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </div>
  )
}

export { Alert }
