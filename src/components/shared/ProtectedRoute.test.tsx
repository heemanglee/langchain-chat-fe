import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'

function TestProtected() {
  return <div>보호된 페이지</div>
}

function renderWithRoute(isAuthenticated: boolean) {
  useAuthStore.setState({ isAuthenticated })
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<TestProtected />} />
        </Route>
        <Route path="/login" element={<div>로그인 페이지</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('인증된 사용자는 보호된 페이지에 접근할 수 있다', () => {
    renderWithRoute(true)
    expect(screen.getByText('보호된 페이지')).toBeInTheDocument()
  })

  it('비인증 사용자는 /login으로 리다이렉트된다', () => {
    renderWithRoute(false)
    expect(screen.getByText('로그인 페이지')).toBeInTheDocument()
  })
})
