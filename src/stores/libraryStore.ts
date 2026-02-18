import { create } from 'zustand'
import type { UploadProgress } from '@/types/library'

interface LibraryState {
  includeArchived: boolean
  uploads: UploadProgress[]

  toggleArchived: () => void
  setIncludeArchived: (value: boolean) => void
  addUpload: (upload: UploadProgress) => void
  updateUpload: (id: string, updates: Partial<UploadProgress>) => void
  removeUpload: (id: string) => void
  clearCompletedUploads: () => void
}

export const useLibraryStore = create<LibraryState>()((set) => ({
  includeArchived: false,
  uploads: [],

  toggleArchived: () =>
    set((state) => ({ includeArchived: !state.includeArchived })),

  setIncludeArchived: (value: boolean) =>
    set({ includeArchived: value }),

  addUpload: (upload: UploadProgress) =>
    set((state) => ({ uploads: [...state.uploads, upload] })),

  updateUpload: (id: string, updates: Partial<UploadProgress>) =>
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === id ? { ...u, ...updates } : u,
      ),
    })),

  removeUpload: (id: string) =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.id !== id),
    })),

  clearCompletedUploads: () =>
    set((state) => ({
      uploads: state.uploads.filter((u) => u.status !== 'completed'),
    })),
}))
