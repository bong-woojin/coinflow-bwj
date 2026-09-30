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
    const triggerRef = useRef<HTMLButtonElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const select = (tf: Timeframe) => {
        setTimeframe(tf)
        setMinOpen(false)
    }

    const selectMin = (tf: Timeframe) => {
        select(tf)
        triggerRef.current?.focus()
    }

    const minActive = MIN_FRAMES.some((f) => f.value === timeframe)

    // 열리면 선택된 항목(없으면 첫 항목)으로 포커스
    useEffect(() => {
        if (!minOpen) return
        const list = listRef.current
        const target =
            list?.querySelector<HTMLButtonElement>('[aria-selected="true"]') ??
            list?.querySelector<HTMLButtonElement>('[role="option"]')
        target?.focus()
    }, [minOpen])

    const onListKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Tab') {
            setMinOpen(false)
            return
        }
        const options = Array.from(
            listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [],
        )
        if (options.length === 0) return
        const idx = options.findIndex((o) => o === document.activeElement)
        let next: number
        switch (e.key) {
            case 'ArrowDown':
                next = (idx + 1) % options.length
                break
            case 'ArrowUp':
                next = (idx - 1 + options.length) % options.length
                break
            case 'Home':
                next = 0
                break
            case 'End':
                next = options.length - 1
                break
            default:
                return
        }
        e.preventDefault()
        options[next].focus()
    }

    // 바깥 클릭 · Escape 로 드롭다운 닫기
    useEffect(() => {
        if (!minOpen) return
        const onMouse = (e: MouseEvent) => {
            if (!(e.target instanceof Node) || !dropdownRef.current?.contains(e.target)) {
                setMinOpen(false)
            }
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return
            setMinOpen(false)
            triggerRef.current?.focus()
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
                        ref={triggerRef}
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
                        <div
                            ref={listRef}
                            className={styles.tfDropdown}
                            role="listbox"
                            aria-label="분봉 선택"
                            onKeyDown={onListKeyDown}
                        >
                            {MIN_FRAMES.map((tf) => (
                                <button
                                    key={tf.value}
                                    type="button"
                                    role="option"
                                    tabIndex={-1}
                                    aria-selected={timeframe === tf.value}
                                    className={
                                        timeframe === tf.value
                                            ? `${styles.tfDropItem} ${styles.tfDropActive}`
                                            : styles.tfDropItem
                                    }
                                    onClick={() => selectMin(tf.value)}
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
                        className={
                            timeframe === tf.value
                                ? `${styles.tfBtn} ${styles.tfActive}`
                                : styles.tfBtn
                        }
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
