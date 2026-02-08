import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ label, error, className, id, ...props }, ref) {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`

    return (
      <div className="space-y-2">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-950 dark:text-zinc-50"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-10 w-full rounded-lg border px-3 text-sm transition-colors',
            'bg-white text-zinc-950 border-zinc-200',
            'dark:bg-zinc-800 dark:text-zinc-50 dark:border-zinc-700',
            'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
            'focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500',
            error && 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  },
)

export { FormField }
