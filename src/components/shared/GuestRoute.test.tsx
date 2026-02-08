import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import { GuestRoute } from './GuestRoute'
import { useAuthStore } from '@/stores/authStore'

function TestGuest() {
  return <div>게스트 페이지</div>
}

function renderWithRoute(isAuthenticated: boolean) {
  useAuthStore.setState({ isAuthenticated })
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<TestGuest />} />
        </Route>
        <Route path="/chat" element={<div>채팅 페이지</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('GuestRoute', () => {
  it('비인증 사용자는 게스트 페이지에 접근할 수 있다', () => {
    renderWithRoute(false)
    expect(screen.getByText('게스트 페이지')).toBeInTheDocument()
  })

  it('인증된 사용자는 /chat으로 리다이렉트된다', () => {
    renderWithRoute(true)
    expect(screen.getByText('채팅 페이지')).toBeInTheDocument()
  })
})
