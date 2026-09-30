export function formatPrice(price: number): string {
    return price.toLocaleString('ko-KR')
}

export function formatChangeRate(rate: number): string {
    const percent = rate * 100
    const sign = percent > 0 ? '+' : ''
    return `${sign}${percent.toFixed(2)}%`
}

// signed_change_price 를 직접 받아 역산 없이 포맷
export function formatChangeDiff(changePrice: number): string {
    const sign = changePrice > 0 ? '+' : ''
    return `${sign}${Math.round(changePrice).toLocaleString('ko-KR')}`
}

const HUNDRED_MILLION = 100_000_000
const TRILLION = 1_000_000_000_000
const TEN_THOUSAND = 10_000

// 억 미만도 정확히: 1.2억 / 350만 / 8,200원
export function formatKrwAmount(amount: number): string {
    if (amount >= HUNDRED_MILLION) return `${(amount / HUNDRED_MILLION).toFixed(1)}억`
    if (amount >= TEN_THOUSAND)
        return `${Math.round(amount / TEN_THOUSAND).toLocaleString('ko-KR')}만`
    return `${Math.round(amount).toLocaleString('ko-KR')}원`
}

// 거래대금 표시 — 조 단위는 별도, 억 미만은 formatKrwAmount 에 위임
export function formatTradePrice(price: number): string {
    if (price >= TRILLION) return `${(price / TRILLION).toFixed(1)}조`
    return formatKrwAmount(price)
}

export type Direction = 'up' | 'down' | 'even'

export function getDirection(value: number): Direction {
    if (value > 0) return 'up'
    if (value < 0) return 'down'
    return 'even'
}

export function formatTime(timestamp: number): string {
    const d = new Date(timestamp)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function formatVolume(volume: number): string {
    return volume.toLocaleString('ko-KR', { maximumFractionDigits: 8 })
}

export function formatCoinVolume(v: number): string {
    if (v >= 1000) return Math.round(v).toLocaleString('ko-KR')
    return v.toLocaleString('ko-KR', { maximumFractionDigits: 3 })
}

// 당일이면 "오늘 HH:MM 기준", 자정 넘기면 "MM.DD HH:MM 기준"
export function formatSnapshotTime(ts: number): string {
    const d = new Date(ts)
    const now = new Date()
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')

    if (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    ) {
        return `오늘 ${hh}:${mm} 기준`
    }

    const MM = String(d.getMonth() + 1).padStart(2, '0')
    const DD = String(d.getDate()).padStart(2, '0')
    return `${MM}.${DD} ${hh}:${mm} 기준`
}

export function toSymbol(market: string): string {
    return market.replace('KRW-', '')
}

// 'YYYY-MM-DD' → 'YY.MM.DD'
export function formatShortDate(date: string): string {
    return date.slice(2).replaceAll('-', '.')
}

// 토스식 전일 대비: '+3,000원 (1.10%)' — 부호는 금액에만
export function formatChangeSummary(changePrice: number, changeRate: number): string {
    const sign = changePrice > 0 ? '+' : ''
    return `${sign}${formatPrice(changePrice)}원 (${(Math.abs(changeRate) * 100).toFixed(2)}%)`
}
