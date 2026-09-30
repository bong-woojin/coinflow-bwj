import { useEffect, useState } from 'react'
import type { UpbitSocketTicker } from '../types'
import { subscribeUpbit } from './upbitSocket'

export function useUpbitTicker(codes: string[]) {
    const [liveMap, setLiveMap] = useState<Record<string, UpbitSocketTicker>>({})
    const codesKey = codes.join(',')

    useEffect(() => {
        if (!codesKey) return

        return subscribeUpbit<UpbitSocketTicker>({
            type: 'ticker',
            codes: codesKey.split(','),
            onMessage: (data) => setLiveMap((prev) => ({ ...prev, [data.code]: data })),
        })
    }, [codesKey])

    return { liveMap }
}
