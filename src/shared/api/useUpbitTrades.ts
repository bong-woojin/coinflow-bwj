import { useEffect, useState } from 'react'
import type { Trade, UpbitSocketTrade } from '../types'
import { parseUpbitJson, subscribeTrade } from './upbitSocket'
import { fetchUpbit, upbitApi } from './upbitApi'

const MAX = 100

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
                setState({
                    market,
                    trades: data.map((t) => ({
                        id: String(t.sequential_id),
                        price: t.trade_price,
                        volume: t.trade_volume,
                        askBid: t.ask_bid,
                        timestamp: t.timestamp,
                    })),
                })
            })
            .catch(() => {})

        const unsubscribe = subscribeTrade([market], (d: UpbitSocketTrade) => {
            const trade: Trade = {
                id: String(d.sequential_id),
                price: d.trade_price,
                volume: d.trade_volume,
                askBid: d.ask_bid,
                timestamp: d.trade_timestamp,
            }
            setState((prev) => {
                // 이전 코인의 목록이 남아 있으면 버리고 새로 시작
                const prevTrades = prev.market === market ? prev.trades : []
                if (prevTrades.some((t) => t.id === trade.id)) return prev
                return { market, trades: [trade, ...prevTrades].slice(0, MAX) }
            })
        })

        return () => {
            cancelled = true
            unsubscribe()
        }
    }, [market])

    return state.market === market ? state.trades : []
}
