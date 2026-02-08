import { Icon } from '@iconify/react'
import { ThemeToggle } from './ThemeToggle'
import { UserDropdown } from './UserDropdown'
import { useSidebarStore } from '@/stores/sidebarStore'

function Navbar() {
  const toggle = useSidebarStore((s) => s.toggle)

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/80">
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="사이드바 토글"
        >
          <Icon icon="solar:hamburger-menu-linear" width={20} />
        </button>

        <div className="flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
            <div className="h-2.5 w-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900" />
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            RAG.OS
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserDropdown />
      </div>
    </header>
  )
}

export { Navbar }
