import { useEffect, useRef, useState } from 'react'
import { useMarketStore } from '../store/market'
import type { Ticker, UpbitMarket, UpbitTicker, UpbitSocketTicker } from '../types'
import { subscribeUpbit } from './upbitSocket'
import { fetchUpbit, upbitApi } from './upbitApi'

export function useMarketFeed() {
    const setTickers = useMarketStore((s) => s.setTickers)
    const applyLiveBatch = useMarketStore((s) => s.applyLiveBatch)
    const setLoading = useMarketStore((s) => s.setLoading)
    const setError = useMarketStore((s) => s.setError)

    const [codesKey, setCodesKey] = useState('')
    const bufferRef = useRef(new Map<string, UpbitSocketTicker>())

    // REST — 초기 스냅샷
    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                setLoading(true)
                setError(null)

                const marketRes = await fetchUpbit(upbitApi.marketAll())
                if (!marketRes.ok) throw new Error('마켓 목록을 불러오지 못했습니다')
                const markets: UpbitMarket[] = await marketRes.json()

                const krw = markets.filter((m) => m.market.startsWith('KRW-'))
                const nameMap = new Map(krw.map((m) => [m.market, m.korean_name]))

                const codeParam = krw.map((m) => m.market).join(',')
                const tickerRes = await fetchUpbit(upbitApi.ticker(codeParam))
                if (!tickerRes.ok) throw new Error('시세를 불러오지 못했습니다')
                const raw: UpbitTicker[] = await tickerRes.json()

                if (cancelled) return

                const list: Ticker[] = raw
                    .map((t) => ({
                        market: t.market,
                        koreanName: nameMap.get(t.market) ?? t.market,
                        tradePrice: t.trade_price,
                        changeRate: t.signed_change_rate,
                        accTradePrice24h: t.acc_trade_price_24h,
                        highPrice: t.high_price,
                        lowPrice: t.low_price,
                        accTradeVolume24h: t.acc_trade_volume_24h,
                    }))
                    .sort((a, b) => b.accTradePrice24h - a.accTradePrice24h)

                setTickers(list, Date.now())
                setCodesKey(codeParam)
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [setTickers, setLoading, setError])

    // WebSocket — 수신은 버퍼에만 적재
    useEffect(() => {
        if (!codesKey) return

        return subscribeUpbit<UpbitSocketTicker>({
            type: 'ticker',
            codes: codesKey.split(','),
            onMessage: (d) => bufferRef.current.set(d.code, d),
        })
    }, [codesKey])

    // 200ms마다 버퍼를 스토어에 반영
    useEffect(() => {
        const id = window.setInterval(() => {
            if (bufferRef.current.size === 0) return
            const batch = Array.from(bufferRef.current.values())
            bufferRef.current.clear()
            applyLiveBatch(batch)
        }, 200)

        return () => clearInterval(id)
    }, [applyLiveBatch])
}