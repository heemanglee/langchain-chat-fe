import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/authStore'

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export { ProtectedRoute }
