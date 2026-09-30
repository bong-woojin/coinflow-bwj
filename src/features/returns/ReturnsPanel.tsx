import { formatChangeRate, formatPrice, getDirection, formatShortDate } from '../../shared/lib/format'
import { usePeriodBases } from './usePeriodBases'
import styles from './ReturnsPanel.module.css'
import dir from '../../shared/styles/direction.module.css'

type ReturnsPanelProps = {
    market: string
    currentPrice: number
}

export default function ReturnsPanel({ market, currentPrice }: ReturnsPanelProps) {
    const { bases, error } = usePeriodBases(market)

    if (error) return <p className={styles.empty}>{error}</p>
    if (!bases) return <p className={styles.empty}>불러오는 중…</p>
    if (bases.length === 0) return <p className={styles.empty}>기간별 데이터가 부족해요</p>

    const rows = bases.map((b) => ({ ...b, rate: currentPrice / b.price - 1 }))
    const maxAbs = Math.max(...rows.map((r) => Math.abs(r.rate)), 0.0001)

    return (
        <div className={styles.returns}>
            <ul className={styles.list}>
                {rows.map((r) => {
                    const direction = getDirection(r.rate)
                    const width = (Math.abs(r.rate) / maxAbs) * 50
                    return (
                        <li key={r.label} className={styles.row}>
                            <div className={styles.meta}>
                                <span className={styles.label}>{r.label}</span>
                                <span className={styles.base}>
                                    {formatPrice(r.price)}원 · {formatShortDate(r.date)}
                                </span>
                            </div>
                            <div className={styles.track} aria-hidden="true">
                                <span
                                    className={styles.bar}
                                    data-direction={direction}
                                    style={{ width: `${width}%` }}
                                />
                            </div>
                            <span className={`${styles.rate} ${dir[direction]}`}>
                                {formatChangeRate(r.rate)}
                            </span>
                        </li>
                    )
                })}
            </ul>
            <p className={styles.note}>기준 가격 대비 현재가 등락률 · 1년은 52주 전 주봉 시가 기준</p>
        </div>
    )
}
