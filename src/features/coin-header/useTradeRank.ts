import { useMarketStore } from '../../shared/store/market'

// 거래대금 순위 — 스토어가 배치 반영 때 계산해 둔 값을 조회만 함
export function useTradeRank(market: string) {
    return useMarketStore((s) => s.rankMap[market] ?? null)
}
