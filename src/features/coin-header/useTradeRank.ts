import { useMarketStore } from '../../shared/store/market'
import type { Ticker, UpbitSocketTicker } from '../../shared/types'

// 같은 배치(tickers·liveMap 참조가 같음)면 이전 결과 재사용 — selector가 여러 번 불려도 정렬은 배치당 한 번
let cache: {
    tickers: Ticker[]
    liveMap: Record<string, UpbitSocketTicker>
    rankMap: Record<string, number>
} | null = null

function getRankMap(tickers: Ticker[], liveMap: Record<string, UpbitSocketTicker>) {
    if (cache && cache.tickers === tickers && cache.liveMap === liveMap) return cache.rankMap

    const amounts = tickers.map((t) => ({
        market: t.market,
        amount: liveMap[t.market]?.acc_trade_price_24h ?? t.accTradePrice24h,
    }))
    amounts.sort((a, b) => b.amount - a.amount)
    const rankMap: Record<string, number> = {}
    amounts.forEach((a, i) => (rankMap[a.market] = i + 1))

    cache = { tickers, liveMap, rankMap }
    return rankMap
}

// 거래대금 순위 — 이 훅을 쓰는 화면(상세)에서만 계산
export function useTradeRank(market: string) {
    return useMarketStore((s) => getRankMap(s.tickers, s.liveMap)[market] ?? null)
}
