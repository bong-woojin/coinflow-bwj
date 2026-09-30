import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'
type SidebarTab = 'watchlist' | 'recent'

type UiState = {
    theme: Theme
    sidebarTab: SidebarTab
    asideOpen: boolean
    searchOpen: boolean
    setTheme: (theme: Theme) => void
    setSidebarTab: (tab: SidebarTab) => void
    toggleAside: () => void
    openSearch: () => void
    closeSearch: () => void
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

export const useUi = create<UiState>()(
    persist(
        (set) => ({
            theme: prefersDark ? 'dark' : 'light',
            sidebarTab: 'watchlist',
            asideOpen: true,
            searchOpen: false,
            setTheme: (theme) => {
                document.documentElement.dataset.theme = theme
                set({ theme })
            },
            setSidebarTab: (tab) => set({ sidebarTab: tab, asideOpen: true }),
            toggleAside: () => set((s) => ({ asideOpen: !s.asideOpen })),
            openSearch: () => set({ searchOpen: true }),
            closeSearch: () => set({ searchOpen: false }),
        }),
        {
            name: 'coinflow-ui',
            partialize: (s) => ({ theme: s.theme }),
            onRehydrateStorage: () => (state) => {
                if (state?.theme) {
                    document.documentElement.dataset.theme = state.theme
                }
            },
        }
    )
)
