import { formatPrice } from '../../shared/lib/format'
import styles from './CoinHeader.module.css'

type RangeRowProps = {
    label: string
    low: number
    high: number
    current: number
}

// 저가 ─●─ 고가. 색 기준은 홈 일중 위치(DayRangeBar)와 같음
export default function RangeRow({ label, low, high, current }: RangeRowProps) {
    const pct = high > low ? ((current - low) / (high - low)) * 100 : 50
    const clamped = Math.min(100, Math.max(0, pct))
    const direction = clamped >= 50 ? 'up' : 'down'

    return (
        <>
            <dt>{label}</dt>
            <dd>{formatPrice(low)}원</dd>
            <dd className={styles.rangeTrack} aria-hidden="true">
                <span className={styles.rangeFill} data-direction={direction} style={{ width: `${clamped}%` }} />
                <span className={styles.rangeDot} data-direction={direction} style={{ left: `${clamped}%` }} />
            </dd>
            <dd>{formatPrice(high)}원</dd>
        </>
    )
}
