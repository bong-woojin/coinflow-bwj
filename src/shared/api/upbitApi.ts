// 같은 도메인의 /upbit 프록시를 거침 (배포: api/upbit.ts, 로컬: vite.config.ts의 server.proxy)
const REST_BASE = '/upbit'

export const UPBIT_WS_URL = 'wss://api.upbit.com/websocket/v1'

export type CandleUnit = 'minutes/1' | 'minutes/15' | 'minutes/60' | 'days' | 'weeks' | 'months'

const RETRY_DELAYS = [300, 600, 1200]
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// 업비트 요청 제한(429)·서버 오류(5xx)·네트워크 오류면 간격을 늘려가며 재시도
export async function fetchUpbit(url: string): Promise<Response> {
    for (let attempt = 0; ; attempt++) {
        try {
            const res = await fetch(url)
            if (res.ok || (res.status !== 429 && res.status < 500) || attempt >= RETRY_DELAYS.length) return res
        } catch (e) {
            if (attempt >= RETRY_DELAYS.length) throw e
        }
        await sleep(RETRY_DELAYS[attempt])
    }
}

// 업비트 REST 주소 모음 (캔들은 한 번에 최대 200개)
export const upbitApi = {
    marketAll: () => `${REST_BASE}/market/all`,
    ticker: (markets: string) => `${REST_BASE}/ticker?markets=${markets}`,
    tradeTicks: (market: string, count: number) => `${REST_BASE}/trades/ticks?market=${market}&count=${count}`,
    candles: (unit: CandleUnit, market: string, count: number) =>
        `${REST_BASE}/candles/${unit}?market=${market}&count=${count}`,
}
