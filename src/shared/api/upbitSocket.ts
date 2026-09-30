import { UPBIT_WS_URL } from './upbitApi'

// 업비트는 웹사이트 Origin으로 들어온 브라우저 소켓을 동시에 1개 정도만 허용하므로,
// 앱 전체에서 연결 1개를 공유하고 구독(ticker·trade)만 합쳐서 보낸다.

type StreamType = 'ticker' | 'trade'

type Subscription = {
    type: StreamType
    codes: Set<string>
    onMessage: (data: never) => void
}

type Options<T> = {
    type: StreamType
    codes: string[]
    onMessage: (data: T) => void
}

const RESEND_DELAY = 50         // 같은 순간의 구독 변경을 모아서 한 번에 전송
const IDLE_CLOSE_DELAY = 1000   // 구독이 모두 사라져도 잠깐 유지 (페이지 이동·StrictMode 재구독 대비)
const PING_INTERVAL = 60_000
const MAX_RECONNECT_DELAY = 30_000

const subs = new Set<Subscription>()
let ws: WebSocket | null = null
let resendTimer: ReturnType<typeof setTimeout> | undefined
let idleTimer: ReturnType<typeof setTimeout> | undefined
let reconnectTimer: ReturnType<typeof setTimeout> | undefined
let pingTimer: ReturnType<typeof setInterval> | undefined
let reconnectDelay = 1000

// 17자리 체결 ID(sequential_id)가 number 정밀도를 넘으므로 파싱 전에 문자열로 감쌈
export function parseUpbitJson(text: string) {
    return JSON.parse(text.replace(/"sequential_id":(\d+)/g, '"sequential_id":"$1"'))
}

function buildRequest() {
    const codesOf = (type: StreamType) => {
        const all = new Set<string>()
        for (const s of subs) if (s.type === type) s.codes.forEach((c) => all.add(c))
        return [...all]
    }
    const streams = (['ticker', 'trade'] as const)
        .map((type) => ({ type, codes: codesOf(type) }))
        .filter((s) => s.codes.length > 0)
    return JSON.stringify([{ ticket: crypto.randomUUID() }, ...streams, { format: 'DEFAULT' }])
}

function sendSubscriptions() {
    if (ws?.readyState === WebSocket.OPEN && subs.size > 0) ws.send(buildRequest())
}

function scheduleResend() {
    clearTimeout(resendTimer)
    resendTimer = setTimeout(sendSubscriptions, RESEND_DELAY)
}

function connect() {
    clearTimeout(reconnectTimer)
    const socket = new WebSocket(UPBIT_WS_URL)
    socket.binaryType = 'arraybuffer'
    ws = socket

    socket.onopen = () => {
        reconnectDelay = 1000
        sendSubscriptions()
        pingTimer = setInterval(() => socket.send('PING'), PING_INTERVAL)
    }

    socket.onmessage = (event) => {
        const data = parseUpbitJson(new TextDecoder().decode(event.data))
        const code = data.code as string | undefined
        if (!code) return   // PING 응답({"status":"UP"}) 등
        for (const s of subs) {
            if (s.type === data.type && s.codes.has(code)) s.onMessage(data as never)
        }
    }

    // 연결 거부(429 등) 시 error만 오고 close가 안 오는 경우가 있어 둘 다에서 처리 (한 번만)
    const handleDown = () => {
        clearInterval(pingTimer)
        if (ws !== socket) return           // 의도적으로 닫았거나 이미 처리한 연결
        ws = null
        if (subs.size === 0) return
        reconnectTimer = setTimeout(connect, reconnectDelay)
        reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY)
    }
    socket.onerror = handleDown
    socket.onclose = handleDown
}

function closeWhenIdle() {
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
        if (subs.size > 0 || !ws) return
        const socket = ws
        ws = null
        clearTimeout(reconnectTimer)
        socket.close()
    }, IDLE_CLOSE_DELAY)
}

// 구독 추가. 반환값은 cleanup용 구독 해제 함수
export function subscribeUpbit<T>({ type, codes, onMessage }: Options<T>) {
    const sub: Subscription = { type, codes: new Set(codes), onMessage: onMessage as (data: never) => void }
    subs.add(sub)
    clearTimeout(idleTimer)

    if (!ws) connect()
    else scheduleResend()

    return () => {
        subs.delete(sub)
        if (subs.size === 0) closeWhenIdle()
        else scheduleResend()
    }
}
