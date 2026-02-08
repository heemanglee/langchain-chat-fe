import { Outlet, Link } from 'react-router'

function ShareLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-700">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
            <div className="h-2 w-2 rounded-full bg-zinc-50 dark:bg-zinc-900" />
          </div>
          <span className="text-sm font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
            RAG.OS
          </span>
        </Link>
        <Link
          to="/register"
          className="flex items-center gap-1 rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          RAG.OS 시작하기
        </Link>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}

export { ShareLayout }
