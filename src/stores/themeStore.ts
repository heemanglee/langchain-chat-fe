import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return theme
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

const storedTheme = (localStorage.getItem('theme') as Theme) ?? 'system'
const initialResolved = getResolvedTheme(storedTheme)

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: storedTheme,
  resolvedTheme: initialResolved,

  setTheme: (theme: Theme) => {
    localStorage.setItem('theme', theme)
    const resolved = getResolvedTheme(theme)
    applyTheme(resolved)
    set({ theme, resolvedTheme: resolved })
  },
}))

// OS 테마 변경 감지
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    const state = useThemeStore.getState()
    if (state.theme === 'system') {
      const resolved = getResolvedTheme('system')
      applyTheme(resolved)
      useThemeStore.setState({ resolvedTheme: resolved })
    }
  })
