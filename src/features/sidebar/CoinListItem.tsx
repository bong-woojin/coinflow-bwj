import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useMarketStore } from '../../shared/store/market'
import { toSymbol } from '../../shared/lib/format'
import CoinLogo from '../../shared/ui/CoinLogo'
import Quote from './Quote'
import styles from './Sidebar.module.css'

type CoinListItemProps = {
    market: string
    name?: string
    removeLabel: string
    onRemove: (market: string) => void
}

// 관심·최근 본 공용 행 — MarketRow처럼 자기 코인 시세만 구독
function CoinListItem({ market, name, removeLabel, onRemove }: CoinListItemProps) {
    const live = useMarketStore((s) => s.liveMap[market])
    const symbol = toSymbol(market)

    return (
        <li className={styles.row}>
            <Link to={`/coins/${market}`} className={styles.item}>
                <span className={styles.values}>
                    <CoinLogo symbol={symbol} size={20} />
                    {name ?? symbol}
                    <span className={styles.coinSymbol}>{symbol}</span>
                </span>
                {live ? (
                    <Quote
                        price={live.trade_price}
                        changePrice={live.signed_change_price}
                        changeRate={live.signed_change_rate}
                    />
                ) : (
                    <span className={styles.values}>–</span>
                )}
            </Link>
            <button
                type="button"
                className={styles.removeBtn}
                aria-label={removeLabel}
                onClick={() => onRemove(market)}
            >
                ✕
            </button>
        </li>
    )
}

export default memo(CoinListItem)
