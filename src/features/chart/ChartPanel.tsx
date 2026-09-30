import { useEffect, useRef, useState } from 'react'
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
    const dropdownRef = useRef<HTMLDivElement>(null)

    const select = (tf: Timeframe) => {
        setTimeframe(tf)
        setMinOpen(false)
    }

    const minActive = MIN_FRAMES.some((f) => f.value === timeframe)

    // 바깥 클릭 · Escape 로 드롭다운 닫기
    useEffect(() => {
        if (!minOpen) return
        const onMouse = (e: MouseEvent) => {
            if (!dropdownRef.current?.contains(e.target as Node)) setMinOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMinOpen(false)
        }
        document.addEventListener('mousedown', onMouse)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onMouse)
            document.removeEventListener('keydown', onKey)
        }
    }, [minOpen])

    return (
        <>
            <div className={styles.timeframeTabs}>
                <div ref={dropdownRef} className={styles.tfGroup}>
                    <button
                        type="button"
                        className={minActive ? `${styles.tfBtn} ${styles.tfActive}` : styles.tfBtn}
                        aria-expanded={minOpen}
                        aria-haspopup="listbox"
                        onClick={() => setMinOpen((o) => !o)}
                    >
                        {MIN_FRAMES.find((f) => f.value === timeframe)?.label ?? '분'}
                        <span className={styles.tfArrow}>{minOpen ? '▲' : '▼'}</span>
                    </button>
                    {minOpen && (
                        <div className={styles.tfDropdown} role="listbox" aria-label="분봉 선택">
                            {MIN_FRAMES.map((tf) => (
                                <button
                                    key={tf.value}
                                    type="button"
                                    role="option"
                                    aria-selected={timeframe === tf.value}
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
                        type="button"
                        aria-pressed={timeframe === tf.value}
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
