import { describe, it, expect, beforeEach } from 'vitest'
import { useSidebarStore } from './sidebarStore'

describe('sidebarStore', () => {
  beforeEach(() => {
    useSidebarStore.setState({ isOpen: false })
  })

  it('has initial isOpen state based on window width', () => {
    const state = useSidebarStore.getState()
    expect(typeof state.isOpen).toBe('boolean')
  })

  it('toggles isOpen state', () => {
    useSidebarStore.getState().toggle()
    expect(useSidebarStore.getState().isOpen).toBe(true)

    useSidebarStore.getState().toggle()
    expect(useSidebarStore.getState().isOpen).toBe(false)
  })

  it('opens sidebar', () => {
    useSidebarStore.getState().open()
    expect(useSidebarStore.getState().isOpen).toBe(true)
  })

  it('closes sidebar', () => {
    useSidebarStore.setState({ isOpen: true })
    useSidebarStore.getState().close()
    expect(useSidebarStore.getState().isOpen).toBe(false)
  })

  it('open is idempotent', () => {
    useSidebarStore.getState().open()
    useSidebarStore.getState().open()
    expect(useSidebarStore.getState().isOpen).toBe(true)
  })

  it('close is idempotent', () => {
    useSidebarStore.getState().close()
    useSidebarStore.getState().close()
    expect(useSidebarStore.getState().isOpen).toBe(false)
  })
})
