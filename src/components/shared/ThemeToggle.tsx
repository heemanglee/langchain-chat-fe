import { Icon } from '@iconify/react'
import { useThemeStore } from '@/stores/themeStore'
import { cn } from '@/lib/utils'

function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeStore()

  function cycleTheme() {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }

  const icon =
    theme === 'light'
      ? 'solar:sun-linear'
      : theme === 'dark'
        ? 'solar:moon-linear'
        : 'solar:monitor-smartphone-linear'

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
        'text-zinc-600 hover:bg-zinc-100',
        'dark:text-zinc-400 dark:hover:bg-zinc-800',
        className,
      )}
      aria-label={`현재 테마: ${theme}. 클릭하여 전환`}
    >
      <Icon icon={icon} width={18} />
    </button>
  )
}

export { ThemeToggle }
