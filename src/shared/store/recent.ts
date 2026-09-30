import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX = 20

type RecentState = {
    markets: string[]
    visit: (market: string) => void
    remove: (market: string) => void
}

export const useRecent = create<RecentState>()(
    persist(
        (set) => ({
            markets: [],
            visit: (market) =>
                set((state) => ({
                    markets: [market, ...state.markets.filter((m) => m !== market)].slice(0, MAX),
                })),
            remove: (market) =>
                set((state) => ({
                    markets: state.markets.filter((m) => m !== market),
                })),
        }),
        { name: 'recent' },
    ),
)
