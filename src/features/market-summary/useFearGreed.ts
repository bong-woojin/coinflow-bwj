import { useEffect, useState } from 'react'

const LABEL_KO: Record<string, string> = {
    'Extreme Fear': '극도의 공포',
    Fear: '공포',
    Neutral: '중립',
    Greed: '탐욕',
    'Extreme Greed': '극도의 탐욕',
}

type FearGreed = {
    value: number
    label: string
}

export function useFearGreed() {
    const [data, setData] = useState<FearGreed | null>(null)

    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const res = await fetch('https://api.alternative.me/fng/?limit=1')
                if (!res.ok) return

                const json: {
                    data: { value: string; value_classification: string }[]
                } = await res.json()

                const first = json.data[0]
                if (cancelled || !first) return

                setData({
                    value: Number(first.value),
                    label: LABEL_KO[first.value_classification] ?? first.value_classification,
                })
            } catch {
                // 부가 지표라 실패해도 화면은 그대로 둔다
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [])

    return data
}