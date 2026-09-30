import { useEffect, useState } from 'react'
import type { Trade, UpbitSocketTrade } from '../types'
import { parseUpbitJson, subscribeTrade } from './upbitSocket'
import { fetchUpbit, upbitApi } from './upbitApi'

const MAX = 100
const FLUSH_INTERVAL = 200

type UpbitTradeTick = {
    sequential_id: string
    trade_price: number
    trade_volume: number
    ask_bid: 'ASK' | 'BID'
    timestamp: number
}

type TradesState = {
    market?: string
    trades: Trade[]
}

export function useUpbitTrades(market: string | undefined) {
    const [state, setState] = useState<TradesState>({ trades: [] })

    useEffect(() => {
        if (!market) return

        let cancelled = false

        fetchUpbit(upbitApi.tradeTicks(market, MAX))
            .then((res) => res.text())
            .then((text) => {
                if (cancelled) return
                const data = parseUpbitJson<UpbitTradeTick[]>(text)
                setState((prev) => {
                    const live = prev.market === market ? prev.trades : []
                    const seen = new Set(live.map((t) => t.id))
                    const rest = data
                        .map((t) => ({
                            id: String(t.sequential_id),
                            price: t.trade_price,
                            volume: t.trade_volume,
                            askBid: t.ask_bid,
                            timestamp: t.timestamp,
                        }))
                        .filter((t) => !seen.has(t.id))
                    return { market, trades: [...live, ...rest].slice(0, MAX) }
                })
            })
            .catch((e) => console.error('[useUpbitTrades]', e))

        // 시세 피드와 같은 방식: 소켓 메시지는 버퍼에만 쌓고 200ms마다 한 번에 반영
        let buffer: Trade[] = []
        const unsubscribe = subscribeTrade([market], (d: UpbitSocketTrade) => {
            buffer.push({
                id: String(d.sequential_id),
                price: d.trade_price,
                volume: d.trade_volume,
                askBid: d.ask_bid,
                timestamp: d.trade_timestamp,
            })
        })

        const flush = setInterval(() => {
            if (buffer.length === 0) return
            const batch = buffer.reverse() // 도착 순서(오래된 → 최신)를 목록 순서(최신 위)로
            buffer = []
            setState((prev) => {
                // 이전 코인의 목록이 남아 있으면 버리고 새로 시작
                const prevTrades = prev.market === market ? prev.trades : []
                const seen = new Set(prevTrades.map((t) => t.id))
                const fresh = batch.filter((t) => !seen.has(t.id) && seen.add(t.id))
                if (fresh.length === 0) return prev
                return { market, trades: [...fresh, ...prevTrades].slice(0, MAX) }
            })
        }, FLUSH_INTERVAL)

        return () => {
            cancelled = true
            clearInterval(flush)
            unsubscribe()
        }
    }, [market])

    return state.market === market ? state.trades : []
}
