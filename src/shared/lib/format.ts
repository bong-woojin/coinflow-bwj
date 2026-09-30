export function formatPrice(price: number): string {
    return price.toLocaleString('ko-KR')
}

export function formatChangeRate(rate: number): string {
    const percent = rate * 100
    const sign = percent > 0 ? '+' : ''
    return `${sign}${percent.toFixed(2)}%`
}

export function formatChangeDiff(price: number, rate: number): string {
    const diff = price - price / (1 + rate)
    const sign = diff > 0 ? '+' : ''
    return `${sign}${Math.round(diff).toLocaleString('ko-KR')}`
}

const HUNDRED_MILLION = 100_000_000      // 1억
const TRILLION = 1_000_000_000_000       // 1조

export function formatTradePrice(price: number): string {
    if (price >= TRILLION) {
        return `${(price / TRILLION).toFixed(1)}조`
    }
    return `${Math.round(price / HUNDRED_MILLION).toLocaleString('ko-KR')}억`
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

export function formatSnapshotTime(ts: number) {
    const d = new Date(ts)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `오늘 ${hh}:${mm} 기준`
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

// 체결강도 = 매수 체결량 / 매도 체결량 × 100
export function calcStrength(bidVolume?: number, askVolume?: number): number | null {
    if (bidVolume === undefined || !askVolume) return null
    return (bidVolume / askVolume) * 100
}

const TEN_THOUSAND = 10_000

// 체결 금액처럼 억 미만도 자주 나오는 금액용: 1.2억 / 350만 / 8,200원
export function formatKrwAmount(amount: number): string {
    if (amount >= HUNDRED_MILLION) return `${(amount / HUNDRED_MILLION).toFixed(1)}억`
    if (amount >= TEN_THOUSAND) return `${Math.round(amount / TEN_THOUSAND).toLocaleString('ko-KR')}만`
    return `${Math.round(amount).toLocaleString('ko-KR')}원`
}
