import { useMemo } from 'react'
import { useMarketStore } from '../../shared/store/market'
import { useFearGreed } from './useFearGreed'
import styles from './MarketStats.module.css'

export default function MarketStats() {
    const tickers = useMarketStore((s) => s.tickers)
    const fng = useFearGreed()

    const dominance = useMemo(() => {
        let total = 0
        let btc = 0

        for (const t of tickers) {
            total += t.accTradePrice24h
            if (t.market === 'KRW-BTC') btc = t.accTradePrice24h
        }

        return total > 0 ? (btc / total) * 100 : 0
    }, [tickers])

    return (
        <div className={styles.stats}>
            <div className={styles.item}>
                <p className={styles.label}>공포 · 탐욕</p>
                <p className={styles.value}>
                    {fng ? fng.value : '—'}
                    {fng && <span className={styles.sub}>{fng.label}</span>}
                </p>
                <div
                    className={styles.gauge}
                    data-tone={
                        fng
                            ? fng.value >= 55
                                ? 'greed'
                                : fng.value <= 45
                                  ? 'fear'
                                  : 'neutral'
                            : 'neutral'
                    }
                >
                    <span style={{ width: `${fng?.value ?? 0}%` }} />
                </div>
            </div>

            <div className={styles.item}>
                <p className={styles.label}>BTC 거래대금 비중</p>
                <p className={styles.value}>{dominance.toFixed(1)}%</p>
                <div className={styles.gauge}>
                    <span style={{ width: `${dominance}%` }} />
                </div>
            </div>
        </div>
    )
}
