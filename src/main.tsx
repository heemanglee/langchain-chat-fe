import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import App from '@/App'
import { useAuthStore } from '@/stores/authStore'

// 앱 초기화 시 localStorage에서 인증 상태 복원
useAuthStore.getState().hydrate()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
