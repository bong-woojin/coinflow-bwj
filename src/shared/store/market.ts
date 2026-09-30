import { create } from 'zustand'
import type { Ticker, UpbitSocketTicker } from '../types'

type Derived = {
    upCount: number
    downCount: number
    totalTradePrice: number
    rankMap: Record<string, number>     // 거래대금 순위 (1위부터)
}

type MarketState = Derived & {
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

// 전 종목 집계는 배치 반영 시 한 번만 — 컴포넌트는 결과 원시값만 구독해 값이 바뀔 때만 리렌더
function derive(tickers: Ticker[], liveMap: Record<string, UpbitSocketTicker>): Derived {
    let upCount = 0
    let downCount = 0
    let totalTradePrice = 0
    const amounts: { market: string; amount: number }[] = []

    for (const t of tickers) {
        const live = liveMap[t.market]
        const rate = live?.signed_change_rate ?? t.changeRate
        const amount = live?.acc_trade_price_24h ?? t.accTradePrice24h
        if (rate > 0) upCount++
        else if (rate < 0) downCount++
        totalTradePrice += amount
        amounts.push({ market: t.market, amount })
    }

    amounts.sort((a, b) => b.amount - a.amount)
    const rankMap: Record<string, number> = {}
    amounts.forEach((a, i) => (rankMap[a.market] = i + 1))

    return { upCount, downCount, totalTradePrice, rankMap }
}

export const useMarketStore = create<MarketState>((set) => ({
    tickers: [],
    liveMap: {},
    snapshotAt: null,
    isLoading: true,
    error: null,
    upCount: 0,
    downCount: 0,
    totalTradePrice: 0,
    rankMap: {},
    setTickers: (tickers, at) => set((s) => ({ tickers, snapshotAt: at, ...derive(tickers, s.liveMap) })),
    applyLiveBatch: (list) =>
        set((s) => {
            const next = { ...s.liveMap }
            for (const t of list) next[t.code] = t
            return { liveMap: next, ...derive(s.tickers, next) }
        }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}))
