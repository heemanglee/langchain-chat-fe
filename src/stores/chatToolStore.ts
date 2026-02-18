import { create } from 'zustand'

interface ChatToolState {
  useWebSearch: boolean
  selectedDocumentIds: number[]

  setUseWebSearch: (value: boolean) => void
  setSelectedDocumentIds: (ids: number[]) => void
  hydrate: (useWebSearch: boolean, selectedDocumentIds: number[]) => void
  reset: () => void
}

export const useChatToolStore = create<ChatToolState>()((set) => ({
  useWebSearch: true,
  selectedDocumentIds: [],

  setUseWebSearch: (value: boolean) => set({ useWebSearch: value }),

  setSelectedDocumentIds: (ids: number[]) =>
    set({ selectedDocumentIds: ids }),

  hydrate: (useWebSearch: boolean, selectedDocumentIds: number[]) =>
    set({ useWebSearch, selectedDocumentIds }),

  reset: () => set({ useWebSearch: true, selectedDocumentIds: [] }),
}))
