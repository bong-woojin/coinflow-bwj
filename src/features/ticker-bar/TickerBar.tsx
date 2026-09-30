import { memo } from 'react'
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

type FeaturedItemProps = {
    market: string
    label: string
}

// 자기 코인 시세만 구독 → 그 코인이 바뀔 때만 리렌더
const FeaturedItem = memo(function FeaturedItem({ market, label }: FeaturedItemProps) {
    const live = useMarketStore((s) => s.liveMap[market])

    return (
        <li>
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
})

export default function TickerBar() {
    const totalTradePrice = useMarketStore((s) => s.totalTradePrice)
    const upCount = useMarketStore((s) => s.upCount)
    const downCount = useMarketStore((s) => s.downCount)

    return (
        <ul className={styles.list}>
            <li className={styles.stat}>
                <span className={styles.label}>전체 거래대금</span>
                <span>{formatTradePrice(totalTradePrice)}</span>
            </li>

            <li className={styles.stat}>
                <span className={styles.label}>상승</span>
                <span className={dir.up}>{upCount}</span>
                <span className={styles.label}>하락</span>
                <span className={dir.down}>{downCount}</span>
            </li>

            <li className={styles.divider} aria-hidden="true" />

            {FEATURED.map(({ market, label }) => (
                <FeaturedItem key={market} market={market} label={label} />
            ))}
        </ul>
    )
}
