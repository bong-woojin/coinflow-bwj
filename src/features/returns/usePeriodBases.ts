import { useEffect, useState } from 'react'
import { fetchUpbit, upbitApi } from '../../shared/api/upbitApi'

export type PeriodBase = {
    label: string
    date: string
    price: number
}

type UpbitCandle = {
    candle_date_time_kst: string
    opening_price: number
    trade_price: number
}

const DAY_PERIODS = [
    { label: '1주', days: 7 },
    { label: '1개월', days: 30 },
    { label: '3개월', days: 90 },
    { label: '6개월', days: 180 },
]

export function usePeriodBases(market: string) {
    const [bases, setBases] = useState<PeriodBase[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        const get = (url: string) =>
            fetchUpbit(url).then((res) => {
                if (!res.ok) throw new Error('기간별 시세를 불러오지 못했습니다')
                return res.json() as Promise<UpbitCandle[]>
            })

        Promise.all([
            get(upbitApi.candles('days', market, 200)),
            get(upbitApi.candles('weeks', market, 53)),
        ])
            .then(([days, weeks]) => {
                if (cancelled) return
                const list: PeriodBase[] = []

                for (const p of DAY_PERIODS) {
                    const c = days[p.days]
                    if (c) list.push({ label: p.label, date: c.candle_date_time_kst.slice(0, 10), price: c.trade_price })
                }
                const yearAgo = weeks[52]
                if (yearAgo) {
                    list.push({ label: '1년', date: yearAgo.candle_date_time_kst.slice(0, 10), price: yearAgo.opening_price })
                }

                setBases(list)
            })
            .catch((e) => {
                if (!cancelled) setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다')
            })

        return () => {
            cancelled = true
        }
    }, [market])

    return { bases, error }
}
