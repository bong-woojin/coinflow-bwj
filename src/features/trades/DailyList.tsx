import {
    formatChangeRate,
    formatCoinVolume,
    formatPrice,
    getDirection,
    formatShortDate,
} from '../../shared/lib/format'
import { useDailyCandles } from './useDailyCandles'
import styles from './TradeList.module.css'
import dir from '../../shared/styles/direction.module.css'

type DailyListProps = {
    market: string
}

export default function DailyList({ market }: DailyListProps) {
    const { candles, error } = useDailyCandles(market)

    if (error) return <div className={styles.empty}>{error}</div>
    if (!candles) return <div className={styles.empty}>불러오는 중…</div>

    return (
        <div className={styles.list} role="table" aria-label="일별 시세">
            <div className={styles.header} role="row">
                <span role="columnheader">일자</span>
                <span role="columnheader">종가</span>
                <span role="columnheader">등락률</span>
                <span role="columnheader">거래량</span>
            </div>

            {candles.map((c, i) => (
                <div className={styles.row} role="row" key={c.date}>
                    <span role="cell" className={styles.time}>
                        {i === 0 ? '오늘' : formatShortDate(c.date)}
                    </span>
                    <span role="cell">{formatPrice(c.close)}원</span>
                    <span role="cell" className={dir[getDirection(c.changeRate)]}>
                        {formatChangeRate(c.changeRate)}
                    </span>
                    <span role="cell">{formatCoinVolume(c.volume)}</span>
                </div>
            ))}
        </div>
    )
}
