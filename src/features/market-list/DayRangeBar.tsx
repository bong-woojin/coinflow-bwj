import styles from './DayRangeBar.module.css'

type DayRangeBarProps = {
    low: number
    high: number
    current: number
}

export default function DayRangeBar({ low, high, current }: DayRangeBarProps) {
    const pct = high > low ? ((current - low) / (high - low)) * 100 : 50
    const clamped = Math.min(100, Math.max(0, pct))

    return (
        <span
            className={styles.wrap}
            title={`일중 위치 ${clamped.toFixed(0)}% (저가 대비)`}
        >
      <span className={styles.value}>{clamped.toFixed(0)}</span>
      <span className={styles.track}>
        <span
            className={clamped >= 50 ? styles.fillUp : styles.fillDown}
            style={{ width: `${clamped}%` }}
        />
      </span>
    </span>
    )
}