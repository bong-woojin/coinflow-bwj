import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type WatchlistState = {
    markets: string[]
    toggle: (market: string) => void
}

export const useWatchlist = create<WatchlistState>()(
    persist(
        (set) => ({
            markets: [],
            toggle: (market) =>
                set((state) => ({
                    markets: state.markets.includes(market)
                        ? state.markets.filter((m) => m !== market)
                        : [...state.markets, market],
                })),
        }),
        { name: 'watchlist' },
    ),
)
