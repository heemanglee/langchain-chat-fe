import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/authStore'

function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />
  }

  return <Outlet />
}

export { GuestRoute }
