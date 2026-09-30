import { useMarketStore } from '../../shared/store/market'

// 거래대금 순위 — 전체 KRW 마켓 기준. 숫자만 반환해서 순위가 바뀔 때만 리렌더
export function useTradeRank(market: string) {
    return useMarketStore((s) => {
        if (s.tickers.length === 0) return null
        const amount = (m: string, fallback: number) => s.liveMap[m]?.acc_trade_price_24h ?? fallback
        const me = s.tickers.find((t) => t.market === market)
        if (!me) return null
        const myAmount = amount(me.market, me.accTradePrice24h)
        let rank = 1
        for (const t of s.tickers) {
            if (t.market !== market && amount(t.market, t.accTradePrice24h) > myAmount) rank++
        }
        return rank
    })
}
