import { useMarketStore } from '../../shared/store/market'
import styles from './MarketBreadth.module.css'

export default function MarketBreadth() {
    const up = useMarketStore((s) => s.upCount)
    const down = useMarketStore((s) => s.downCount)
    const total = useMarketStore((s) => s.tickers.length) || 1

    const upPct = (up / total) * 100
    const downPct = (down / total) * 100

    return (
        <div className={styles.wrap}>
            <div className={styles.head}>
                <span className={styles.title}>상승 · 하락</span>
                <span className={styles.counts}>
                    <b className={styles.countUp}>{up}</b>
                    <span className={styles.slash}>/</span>
                    <b className={styles.countDown}>{down}</b>
                </span>
            </div>

            <div
                className={styles.bar}
                role="img"
                aria-label={`상승 ${up}종목, 하락 ${down}종목, 전체 ${total}종목`}
            >
                <span className={styles.segUp} style={{ width: `${upPct}%` }} />
                <span className={styles.segFlat} style={{ width: `${100 - upPct - downPct}%` }} />
                <span className={styles.segDown} style={{ width: `${downPct}%` }} />
            </div>
        </div>
    )
}
