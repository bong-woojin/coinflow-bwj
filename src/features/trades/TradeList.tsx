import {
    formatChangeRate,
    formatPrice,
    formatTime,
    formatVolume,
    getDirection,
} from '../../shared/lib/format'
import type { Trade } from '../../shared/types'
import styles from './TradeList.module.css'
import dir from '../../shared/styles/direction.module.css'

type TradeListProps = {
    trades: Trade[]
    prevClose: number // 등락률 계산 기준 (전일 종가)
}

export default function TradeList({ trades, prevClose }: TradeListProps) {
    if (trades.length === 0) {
        return <div className={styles.empty}>체결 내역을 기다리는 중…</div>
    }

    return (
        <div className={styles.list} role="table" aria-label="체결 내역">
            <div className={styles.header} role="row">
                <span role="columnheader">체결가</span>
                <span role="columnheader">체결량</span>
                <span role="columnheader">등락률</span>
                <span role="columnheader">시간</span>
            </div>

            {trades.map((trade) => {
                const rate = prevClose ? trade.price / prevClose - 1 : 0
                return (
                    <div className={styles.row} role="row" key={trade.id}>
                        <span role="cell">{formatPrice(trade.price)}원</span>
                        <span
                            role="cell"
                            className={trade.askBid === 'BID' ? styles.bid : styles.ask}
                        >
                            {formatVolume(trade.volume)}
                        </span>
                        <span role="cell" className={dir[getDirection(rate)]}>
                            {formatChangeRate(rate)}
                        </span>
                        <span role="cell" className={styles.time}>
                            {formatTime(trade.timestamp)}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
