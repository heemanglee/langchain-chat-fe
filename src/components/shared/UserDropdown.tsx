import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { Icon } from '@iconify/react'
import { useAuthStore } from '@/stores/authStore'
import { logout } from '@/api/auth'

function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, refreshToken, clearAuth } = useAuthStore()

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      if (refreshToken) {
        await logout({ refresh_token: refreshToken })
      }
    } catch {
      // logout failed silently
    } finally {
      clearAuth()
      navigate('/login')
    }
  }, [refreshToken, clearAuth, navigate])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        aria-label="사용자 메뉴"
        aria-expanded={isOpen}
      >
        <Icon
          icon="solar:user-circle-linear"
          width={22}
          className="text-zinc-600 dark:text-zinc-400"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {user && (
            <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-700">
              <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {user.username}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {user.email}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-zinc-50 dark:text-red-400 dark:hover:bg-zinc-700/50"
          >
            <Icon icon="solar:logout-2-linear" width={18} />
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}

export { UserDropdown }
