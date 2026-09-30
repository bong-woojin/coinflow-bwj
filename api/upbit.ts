// Vercel 서버 함수: 브라우저 대신 업비트 REST를 호출하는 프록시
// 업비트는 웹사이트 Origin이 붙은 브라우저 요청을 'origin' 그룹(초당 약 1회)으로 제한하므로,
// Origin 없이 서버에서 요청해 일반 제한 그룹으로 처리되게 한다.
const UPBIT = 'https://api.upbit.com/v1'

// 이 앱이 쓰는 경로만 허용 (열린 프록시 방지)
const ALLOWED = /^(market\/all|ticker|trades\/ticks|candles\/(minutes\/(1|15|60)|days|weeks|months))$/

export async function GET(request: Request) {
    const url = new URL(request.url)
    const path = url.searchParams.get('path') ?? ''
    if (!ALLOWED.test(path)) {
        return new Response('Not allowed', { status: 400 })
    }

    url.searchParams.delete('path')
    let res: Response
    try {
        res = await fetch(`${UPBIT}/${path}?${url.searchParams}`, {
            headers: { accept: 'application/json' },
        })
    } catch {
        // 업비트 연결 실패 → 502로 응답해 클라이언트(fetchUpbit)가 재시도하게 함
        return new Response('Upstream error', { status: 502, headers: { 'cache-control': 'no-store' } })
    }

    // 마켓 목록은 거의 안 바뀌므로 1시간, 시세·캔들은 1초만 엣지 캐시
    const cache = path === 'market/all'
        ? 'public, s-maxage=3600, stale-while-revalidate=86400'
        : 'public, s-maxage=1, stale-while-revalidate=5'

    return new Response(res.body, {
        status: res.status,
        headers: {
            'content-type': res.headers.get('content-type') ?? 'application/json',
            'cache-control': res.ok ? cache : 'no-store',
        },
    })
}
