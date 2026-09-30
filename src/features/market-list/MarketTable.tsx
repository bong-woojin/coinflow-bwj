import type { Ticker } from '../../shared/types'
import { formatSnapshotTime } from '../../shared/lib/format'
import MarketRow from './MarketRow'
import styles from './MarketTable.module.css'

type MarketTableProps = {
    tickers: Ticker[]
    snapshotAt: number | null
}

export default function MarketTable({ tickers, snapshotAt }: MarketTableProps) {
    return (
        <div className={styles.table} role="table">
            <div className={styles.header} role="row">
                <span className={styles.rankHead} role="columnheader" aria-colspan={3}>
                    {snapshotAt ? `순위·${formatSnapshotTime(snapshotAt)}` : '순위'}
                </span>
                <span role="columnheader">현재가</span>
                <span role="columnheader" className={styles.rateHead}>등락률</span>
                <span role="columnheader">고가</span>
                <span role="columnheader">저가</span>
                <span role="columnheader" className={styles.rangeHead}>일중 위치</span>
                <span role="columnheader">거래대금 순</span>
                <span role="columnheader">거래량</span>
            </div>

            {tickers.map((coin, index) => (
                <MarketRow
                    key={coin.market}
                    market={coin.market}
                    koreanName={coin.koreanName}
                    rank={index + 1}
                    fallbackPrice={coin.tradePrice}
                    fallbackRate={coin.changeRate}
                    fallbackVolume={coin.accTradePrice24h}
                    fallbackHigh={coin.highPrice}
                    fallbackLow={coin.lowPrice}
                    fallbackCoinVolume={coin.accTradeVolume24h}
                />
            ))}
        </div>
    )
}
