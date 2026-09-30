import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMarketStore } from '../../shared/store/market'
import { formatTradePrice } from '../../shared/lib/format'
import Price from '../../shared/ui/Price'
import ChangeRate from '../../shared/ui/ChangeRate'
import styles from './TickerBar.module.css'
import dir from '../../shared/styles/direction.module.css'

const FEATURED = [
    { market: 'KRW-BTC', label: '비트코인' },
    { market: 'KRW-ETH', label: '이더리움' },
    { market: 'KRW-XRP', label: '리플' },
    { market: 'KRW-SOL', label: '솔라나' },
    { market: 'KRW-DOGE', label: '도지코인' },
]

export default function TickerBar() {
    const tickers = useMarketStore((s) => s.tickers)
    const liveMap = useMarketStore((s) => s.liveMap)

    const { totalVolume, upCount, downCount } = useMemo(() => {
        let totalVolume = 0
        let upCount = 0
        let downCount = 0

        for (const t of tickers) {
            const live = liveMap[t.market]
            totalVolume += live?.acc_trade_price_24h ?? t.accTradePrice24h
            const rate = live?.signed_change_rate ?? t.changeRate
            if (rate > 0) upCount += 1
            else if (rate < 0) downCount += 1
        }

        return { totalVolume, upCount, downCount }
    }, [tickers, liveMap])

    return (
        <ul className={styles.list}>
            <li className={styles.stat}>
                <span className={styles.label}>전체 거래대금</span>
                <span>{formatTradePrice(totalVolume)}</span>
            </li>

            <li className={styles.stat}>
                <span className={styles.label}>상승</span>
                <span className={dir.up}>{upCount}</span>
                <span className={styles.label}>하락</span>
                <span className={dir.down}>{downCount}</span>
            </li>

            <li className={styles.divider} aria-hidden="true" />

            {FEATURED.map(({ market, label }) => {
                const live = liveMap[market]
                return (
                    <li key={market}>
                        <Link to={`/coins/${market}`} className={styles.item}>
                            <span className={styles.label}>{label}</span>
                            {live ? (
                                <>
                                    <Price value={live.trade_price} />
                                    <ChangeRate rate={live.signed_change_rate} />
                                </>
                            ) : (
                                <span className={styles.label}>–</span>
                            )}
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}