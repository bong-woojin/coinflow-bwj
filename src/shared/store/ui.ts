import { create } from 'zustand'

type SidebarTab = 'watchlist' | 'recent'

type UiState = {
    sidebarTab: SidebarTab
    asideOpen: boolean
    searchOpen: boolean
    setSidebarTab: (tab: SidebarTab) => void
    toggleAside: () => void
    openSearch: () => void
    closeSearch: () => void
}

export const useUi = create<UiState>((set) => ({
    sidebarTab: 'watchlist',
    asideOpen: true,
    searchOpen: false,
    setSidebarTab: (tab) => set({ sidebarTab: tab, asideOpen: true }),
    toggleAside: () => set((s) => ({ asideOpen: !s.asideOpen })),
    openSearch: () => set({ searchOpen: true }),
    closeSearch: () => set({ searchOpen: false }),
}))
