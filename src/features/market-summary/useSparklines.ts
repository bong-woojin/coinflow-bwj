import { useEffect, useState } from 'react'
import { fetchUpbit, upbitApi } from '../../shared/api/upbitApi'

export function useSparklines(markets: string[]) {
    const [data, setData] = useState<Record<string, number[]>>({})
    const key = markets.join(',')

    useEffect(() => {
        let cancelled = false

        async function load() {
            const list = key.split(',')

            const results = await Promise.all(
                list.map(async (market) => {
                    const res = await fetchUpbit(
                        upbitApi.candles('minutes/60', market, 24)
                    )
                    if (!res.ok) return [market, [] as number[]] as const

                    const json: { trade_price: number }[] = await res.json()
                    return [market, json.map((c) => c.trade_price).reverse()] as const
                })
            )

            if (cancelled) return
            setData(Object.fromEntries(results))
        }

        load()
        return () => {
            cancelled = true
        }
    }, [key])

    return data
}