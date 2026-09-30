import { create } from 'zustand'
import type { Ticker, UpbitSocketTicker } from '../types'

type MarketState = {
    tickers: Ticker[]
    liveMap: Record<string, UpbitSocketTicker>
    snapshotAt: number | null
    isLoading: boolean
    error: string | null
    setTickers: (tickers: Ticker[], at: number) => void
    applyLiveBatch: (list: UpbitSocketTicker[]) => void
    setLoading: (v: boolean) => void
    setError: (e: string | null) => void
}

export const useMarketStore = create<MarketState>((set) => ({
    tickers: [],
    liveMap: {},
    snapshotAt: null,
    isLoading: true,
    error: null,
    setTickers: (tickers, at) => set({ tickers, snapshotAt: at }),
    applyLiveBatch: (list) =>
        set((s) => {
            const next = { ...s.liveMap }
            for (const t of list) next[t.code] = t
            return { liveMap: next }
        }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}))