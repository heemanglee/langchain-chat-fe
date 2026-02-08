import { Outlet } from 'react-router'

function AppLayout() {
  // Phase 3에서 Sidebar + Navbar 구현 예정
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

export { AppLayout }
