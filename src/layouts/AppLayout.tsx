import { Outlet } from 'react-router'
import { Navbar } from '@/components/shared/Navbar'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { useSidebarStore } from '@/stores/sidebarStore'
import { cn } from '@/lib/utils'

function AppLayout() {
  const isOpen = useSidebarStore((s) => s.isOpen)

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <div className="flex flex-1 pt-14">
        <Sidebar />

        <main
          className={cn(
            'flex flex-1 flex-col overflow-hidden transition-all duration-300',
            isOpen ? 'lg:ml-0' : '',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export { AppLayout }
