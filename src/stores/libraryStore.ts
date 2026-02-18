import { create } from 'zustand'
import type { UploadProgress } from '@/types/library'

interface LibraryState {
  includeArchived: boolean
  uploads: UploadProgress[]
  selectedIds: Set<number>

  toggleArchived: () => void
  setIncludeArchived: (value: boolean) => void
  addUpload: (upload: UploadProgress) => void
  updateUpload: (id: string, updates: Partial<UploadProgress>) => void
  removeUpload: (id: string) => void
  clearCompletedUploads: () => void
  toggleSelection: (id: number) => void
  selectAll: (ids: number[]) => void
  clearSelection: () => void
}

export const useLibraryStore = create<LibraryState>()((set) => ({
  includeArchived: false,
  uploads: [],
  selectedIds: new Set<number>(),

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

  toggleSelection: (id: number) =>
    set((state) => {
      const next = new Set(state.selectedIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return { selectedIds: next }
    }),

  selectAll: (ids: number[]) =>
    set((state) => {
      const allSelected = ids.every((id) => state.selectedIds.has(id))
      return { selectedIds: allSelected ? new Set<number>() : new Set(ids) }
    }),

  clearSelection: () =>
    set({ selectedIds: new Set<number>() }),
}))
