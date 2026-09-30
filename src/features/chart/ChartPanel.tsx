import { useState } from 'react'
import CandleChart, { type Timeframe } from './CandleChart'
import styles from './ChartPanel.module.css'

const MIN_FRAMES: { label: string; value: Timeframe }[] = [
    { label: '1분', value: '1m' },
    { label: '15분', value: '15m' },
    { label: '60분', value: '1h' },
]

const DAY_FRAMES: { label: string; value: Timeframe }[] = [
    { label: '일', value: '1d' },
    { label: '주', value: '1w' },
    { label: '월', value: '1mo' },
    { label: '년', value: '1y' },
]

type ChartPanelProps = {
    market: string
}

// 기간 탭(분 단위는 드롭다운) + 캔들 차트
export default function ChartPanel({ market }: ChartPanelProps) {
    const [timeframe, setTimeframe] = useState<Timeframe>('1m')
    const [minOpen, setMinOpen] = useState(false)

    const select = (tf: Timeframe) => {
        setTimeframe(tf)
        setMinOpen(false)
    }

    const minActive = MIN_FRAMES.some((f) => f.value === timeframe)

    return (
        <>
            <div className={styles.timeframeTabs}>
                <div className={styles.tfGroup}>
                    <button
                        className={minActive ? `${styles.tfBtn} ${styles.tfActive}` : styles.tfBtn}
                        onClick={() => setMinOpen((o) => !o)}
                    >
                        {MIN_FRAMES.find((f) => f.value === timeframe)?.label ?? '분'}
                        <span className={styles.tfArrow}>{minOpen ? '▲' : '▼'}</span>
                    </button>
                    {minOpen && (
                        <div className={styles.tfDropdown}>
                            {MIN_FRAMES.map((tf) => (
                                <button
                                    key={tf.value}
                                    className={timeframe === tf.value
                                        ? `${styles.tfDropItem} ${styles.tfDropActive}`
                                        : styles.tfDropItem}
                                    onClick={() => select(tf.value)}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {DAY_FRAMES.map((tf) => (
                    <button
                        key={tf.value}
                        className={timeframe === tf.value ? `${styles.tfBtn} ${styles.tfActive}` : styles.tfBtn}
                        onClick={() => select(tf.value)}
                    >
                        {tf.label}
                    </button>
                ))}
            </div>
            <div className={styles.chartWrap}>
                <CandleChart market={market} timeframe={timeframe} />
            </div>
        </>
    )
}
