import { Outlet, Link } from 'react-router'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
            <div className="h-2 w-2 rounded-full bg-zinc-50 dark:bg-zinc-900" />
          </div>
          <span className="text-sm font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
            RAG.OS
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <Outlet />
      </main>
    </div>
  )
}

export { AuthLayout }
