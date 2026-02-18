import { useNavigate, useLocation } from 'react-router'
import { Icon } from '@iconify/react'
import { SidebarConversationList } from './SidebarConversationList'
import { useSidebarStore } from '@/stores/sidebarStore'
import { cn } from '@/lib/utils'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isOpen, close } = useSidebarStore()

  function handleNewChat() {
    navigate('/chat')
    if (window.innerWidth < 1024) {
      close()
    }
  }

  function handleLibrary() {
    navigate('/library')
    if (window.innerWidth < 1024) {
      close()
    }
  }

  function handleSelectConversation() {
    if (window.innerWidth < 1024) {
      close()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-zinc-200 bg-white pt-14 transition-transform duration-300 dark:border-zinc-700 dark:bg-zinc-900',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:z-auto lg:pt-0',
        )}
      >
        {/* New chat button */}
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={handleNewChat}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            <Icon icon="solar:add-circle-linear" width={18} />
            새 채팅
          </button>
        </div>

        {/* Navigation sections */}
        <nav className="flex flex-1 flex-col overflow-hidden">
          <div className="space-y-0.5 px-3 pb-2">
            <SidebarNavItem
              icon="solar:library-linear"
              label="라이브러리"
              active={location.pathname === '/library'}
              onClick={handleLibrary}
            />
            <SidebarNavItem
              icon="solar:robot-bold"
              label="에이전트"
              disabled
            />
          </div>

          <div className="mx-3 border-t border-zinc-100 dark:border-zinc-800" />

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <p className="mb-1 px-3 text-xs font-medium text-zinc-400 dark:text-zinc-500">
              최근 대화
            </p>
            <SidebarConversationList
              onSelectConversation={handleSelectConversation}
            />
          </div>
        </nav>
      </aside>
    </>
  )
}

function SidebarNavItem({
  icon,
  label,
  disabled,
  active,
  onClick,
}: {
  icon: string
  label: string
  disabled?: boolean
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
          : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800',
      )}
    >
      <Icon icon={icon} width={18} />
      {label}
    </button>
  )
}

export { Sidebar }
