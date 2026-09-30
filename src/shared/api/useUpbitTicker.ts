import { useEffect, useState } from 'react'
import type { UpbitSocketTicker } from '../types'
import { subscribeTicker } from './upbitSocket'

export function useUpbitTicker(codes: string[]) {
    const [liveMap, setLiveMap] = useState<Record<string, UpbitSocketTicker>>({})
    const codesKey = codes.join(',')

    useEffect(() => {
        if (!codesKey) return

        return subscribeTicker(codesKey.split(','), (data) =>
            setLiveMap((prev) => ({ ...prev, [data.code]: data }))
        )
    }, [codesKey])

    return { liveMap }
}
