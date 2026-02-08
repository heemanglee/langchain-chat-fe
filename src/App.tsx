import { BrowserRouter, Routes, Route } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { ShareLayout } from '@/layouts/ShareLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { GuestRoute } from '@/components/shared/GuestRoute'
import { Landing } from '@/pages/landing/Landing'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Chat } from '@/pages/Chat'
import { SharedSession } from '@/pages/SharedSession'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public: 랜딩 페이지 */}
          <Route path="/" element={<Landing />} />

          {/* Guest Only: 인증 페이지 */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>

          {/* Protected: 메인 앱 */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:conversationId" element={<Chat />} />
            </Route>
          </Route>

          {/* Public: 공유 세션 */}
          <Route element={<ShareLayout />}>
            <Route path="/share/:shareToken" element={<SharedSession />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
