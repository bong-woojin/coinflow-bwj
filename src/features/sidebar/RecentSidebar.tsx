import { useMarketStore } from '../../shared/store/market'
import { useMemo } from 'react'
import styles from './Sidebar.module.css'
import { useRecent } from '../../shared/store/recent'
import CoinListItem from './CoinListItem'

export default function RecentSidebar() {
    const markets = useRecent((s) => s.markets)
    const remove = useRecent((s) => s.remove)
    const tickers = useMarketStore((s) => s.tickers)

    const nameMap = useMemo(
        () => new Map(tickers.map((t) => [t.market, t.koreanName])),
        [tickers]
    )

    return (
        <div className={styles.sidebar}>
            <h2 className={styles.title}>
                최근 본 <span className={styles.count}>{markets.length}</span>
            </h2>

            {markets.length === 0 ? (
                <p className={styles.empty}>
                    코인을 조회하면
                    <br />
                    여기에 쌓입니다
                </p>
            ) : (
                <ul className={styles.list}>
                    {markets.map((market) => (
                        <CoinListItem
                            key={market}
                            market={market}
                            name={nameMap.get(market)}
                            removeLabel="최근 본 목록에서 제거"
                            onRemove={remove}
                        />
                    ))}
                </ul>
            )}
        </div>
    )
}
