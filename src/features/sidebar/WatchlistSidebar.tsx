import { useWatchlist } from '../../shared/store/watchlist'
import { useMarketStore } from '../../shared/store/market'
import { useMemo } from 'react'
import styles from './Sidebar.module.css'
import CoinListItem from './CoinListItem'

export default function WatchlistSidebar() {
    const markets = useWatchlist((s) => s.markets)
    const toggle = useWatchlist((s) => s.toggle)
    const tickers = useMarketStore((s) => s.tickers)

    const nameMap = useMemo(
        () => new Map(tickers.map((t) => [t.market, t.koreanName])),
        [tickers]
    )

    return (
        <div className={styles.sidebar}>
            <h2 className={styles.title}>
                관심목록 <span className={styles.count}>{markets.length}</span>
            </h2>

            {markets.length === 0 ? (
                <p className={styles.empty}>
                    목록에서 ♡ 를 눌러
                    <br />
                    관심 코인을 추가해보세요
                </p>
            ) : (
                <ul className={styles.list}>
                    {markets.map((market) => (
                        <CoinListItem
                            key={market}
                            market={market}
                            name={nameMap.get(market)}
                            removeLabel="관심목록에서 제거"
                            onRemove={toggle}
                        />
                    ))}
                </ul>
            )}
        </div>
    )
}
