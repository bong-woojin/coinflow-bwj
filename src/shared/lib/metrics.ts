// 체결강도 = 매수 체결량 / 매도 체결량 × 100
export function calcStrength(bidVolume?: number, askVolume?: number): number | null {
    if (bidVolume === undefined || !askVolume) return null
    return (bidVolume / askVolume) * 100
}
