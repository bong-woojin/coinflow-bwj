import type { UpbitSocketMessage, UpbitSocketNotice, UpbitSocketTicker, UpbitSocketTrade } from '../types'
import { UPBIT_WS_URL } from './upbitApi'

// 업비트는 웹사이트 Origin으로 들어온 브라우저 소켓을 동시에 1개 정도만 허용하므로,
// 앱 전체에서 연결 1개를 공유하고 구독(ticker·trade)만 합쳐서 보낸다.

type Subscription<T> = {
    codes: Set<string>
    onMessage: (data: T) => void
}

const RESEND_DELAY = 50         // 같은 순간의 구독 변경을 모아서 한 번에 전송
const IDLE_CLOSE_DELAY = 1000   // 구독이 모두 사라져도 잠깐 유지 (페이지 이동·StrictMode 재구독 대비)
const PING_INTERVAL = 60_000
const MAX_RECONNECT_DELAY = 30_000

const tickerSubs = new Set<Subscription<UpbitSocketTicker>>()
const tradeSubs = new Set<Subscription<UpbitSocketTrade>>()
let ws: WebSocket | null = null
let resendTimer: ReturnType<typeof setTimeout> | undefined
let idleTimer: ReturnType<typeof setTimeout> | undefined
let reconnectTimer: ReturnType<typeof setTimeout> | undefined
let reconnectDelay = 1000

const subCount = () => tickerSubs.size + tradeSubs.size

// 17자리 체결 ID(sequential_id)가 number 정밀도를 넘으므로 파싱 전에 문자열로 감쌈.
// 응답 구조는 업비트를 신뢰하는 경계 (res.json()과 같은 성격)
export function parseUpbitJson<T>(text: string): T {
    return JSON.parse(text.replace(/"sequential_id":(\d+)/g, '"sequential_id":"$1"'))
}

function codesOf<T>(subs: Set<Subscription<T>>) {
    const all = new Set<string>()
    for (const s of subs) s.codes.forEach((c) => all.add(c))
    return [...all]
}

function buildRequest() {
    const streams = [
        { type: 'ticker', codes: codesOf(tickerSubs) },
        { type: 'trade', codes: codesOf(tradeSubs) },
    ].filter((s) => s.codes.length > 0)
    return JSON.stringify([{ ticket: crypto.randomUUID() }, ...streams, { format: 'DEFAULT' }])
}

function sendSubscriptions() {
    if (ws?.readyState === WebSocket.OPEN && subCount() > 0) ws.send(buildRequest())
}

function scheduleResend() {
    clearTimeout(resendTimer)
    resendTimer = setTimeout(sendSubscriptions, RESEND_DELAY)
}

function dispatch<T extends UpbitSocketMessage>(subs: Set<Subscription<T>>, data: T) {
    for (const s of subs) if (s.codes.has(data.code)) s.onMessage(data)
}

function connect() {
    clearTimeout(reconnectTimer)
    if (subCount() === 0) return            // 재연결 예약 뒤 구독이 모두 해제된 경우 — 구독 0개짜리 소켓을 열지 않음
    const socket = new WebSocket(UPBIT_WS_URL)
    socket.binaryType = 'arraybuffer'
    ws = socket
    // 연결마다 따로 관리 — 늦게 도착한 이전 소켓의 close가 새 연결의 PING을 지우지 않도록
    let pingTimer: ReturnType<typeof setInterval> | undefined

    socket.onopen = () => {
        reconnectDelay = 1000
        sendSubscriptions()
        pingTimer = setInterval(() => socket.send('PING'), PING_INTERVAL)
    }

    socket.onmessage = (event) => {
        const data = parseUpbitJson<UpbitSocketMessage | UpbitSocketNotice>(new TextDecoder().decode(event.data))
        if (!('type' in data)) return       // PING 응답·요청 오류 등 시세가 아닌 메시지
        if (data.type === 'ticker') dispatch(tickerSubs, data)
        else dispatch(tradeSubs, data)
    }

    // 연결 거부(429 등) 시 error만 오고 close가 안 오는 경우가 있어 둘 다에서 처리 (한 번만)
    const handleDown = () => {
        clearInterval(pingTimer)
        if (ws !== socket) return           // 의도적으로 닫았거나 이미 처리한 연결
        ws = null
        if (subCount() === 0) return
        reconnectTimer = setTimeout(connect, reconnectDelay)
        reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY)
    }
    socket.onerror = handleDown
    socket.onclose = handleDown
}

function closeWhenIdle() {
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
        if (subCount() > 0) return
        // 연결이 끊겨 ws가 null이어도 예약된 재연결은 반드시 취소
        clearTimeout(reconnectTimer)
        if (!ws) return
        const socket = ws
        ws = null                           // handleDown이 '의도적 종료'로 보고 재연결하지 않도록 먼저 비움
        socket.close()
    }, IDLE_CLOSE_DELAY)
}

function subscribe<T>(subs: Set<Subscription<T>>, codes: string[], onMessage: (data: T) => void) {
    const sub: Subscription<T> = { codes: new Set(codes), onMessage }
    subs.add(sub)
    clearTimeout(idleTimer)

    if (!ws) connect()
    else scheduleResend()

    return () => {
        subs.delete(sub)
        if (subCount() === 0) closeWhenIdle()
        else scheduleResend()
    }
}

// 구독 추가. 반환값은 cleanup용 구독 해제 함수
export const subscribeTicker = (codes: string[], onMessage: (data: UpbitSocketTicker) => void) =>
    subscribe(tickerSubs, codes, onMessage)

export const subscribeTrade = (codes: string[], onMessage: (data: UpbitSocketTrade) => void) =>
    subscribe(tradeSubs, codes, onMessage)
