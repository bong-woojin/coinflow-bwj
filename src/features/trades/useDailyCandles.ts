import { useEffect, useState } from 'react'
import { fetchUpbit, upbitApi } from '../../shared/api/upbitApi'

export type DailyCandle = {
    date: string
    close: number
    changeRate: number
    volume: number
}

type UpbitDayCandle = {
    candle_date_time_kst: string
    trade_price: number
    change_rate: number
    candle_acc_trade_volume: number
}

export function useDailyCandles(market: string, count = 30) {
    const [candles, setCandles] = useState<DailyCandle[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        fetchUpbit(upbitApi.candles('days', market, count))
            .then((res): Promise<UpbitDayCandle[]> => {
                if (!res.ok) throw new Error('일별 시세를 불러오지 못했습니다')
                return res.json()
            })
            .then((data) => {
                if (cancelled) return
                setCandles(
                    data.map((c) => ({
                        date: c.candle_date_time_kst.slice(0, 10),
                        close: c.trade_price,
                        changeRate: c.change_rate,
                        volume: c.candle_acc_trade_volume,
                    })),
                )
            })
            .catch((e) => {
                if (!cancelled)
                    setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다')
            })

        return () => {
            cancelled = true
        }
    }, [market, count])

    return { candles, error }
}
