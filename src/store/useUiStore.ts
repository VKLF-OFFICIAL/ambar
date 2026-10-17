import { create } from 'zustand'

export type Tab = 'home' | 'journal' | 'reasons' | 'progress' | 'settings'

interface UiState {
  tab: Tab
  setTab: (tab: Tab) => void
  sosOpen: boolean
  openSos: () => void
  closeSos: () => void
  relapseFor: string | null
  openRelapse: (trackerId: string) => void
  closeRelapse: () => void
  locked: boolean
  addingTracker: boolean
  setAddingTracker: (v: boolean) => void
  lock: () => void
  unlock: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  tab: 'home',
  setTab: (tab) => set({ tab }),
  sosOpen: false,
  openSos: () => set({ sosOpen: true }),
  closeSos: () => set({ sosOpen: false }),
  relapseFor: null,
  openRelapse: (trackerId) => set({ relapseFor: trackerId, sosOpen: false }),
  closeRelapse: () => set({ relapseFor: null }),
  locked: false,
  addingTracker: false,
  setAddingTracker: (addingTracker) => set({ addingTracker }),
  lock: () => set({ locked: true, relapseFor: null }),
  unlock: () => set({ locked: false }),
}))
