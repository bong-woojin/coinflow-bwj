import { memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMarketStore } from '../../shared/store/market'
import {
    formatPrice,
    formatTradePrice,
    formatCoinVolume,
    getDirection,
    toSymbol,
} from '../../shared/lib/format'
import { useFlash } from './useFlash'
import Price from '../../shared/ui/Price'
import ChangeRate from '../../shared/ui/ChangeRate'
import WatchButton from '../../shared/ui/WatchButton'
import DayRangeBar from './DayRangeBar'
import styles from './MarketTable.module.css'
import CoinLogo from '../../shared/ui/CoinLogo'

type MarketRowProps = {
    market: string
    koreanName: string
    rank: number
    fallbackPrice: number
    fallbackRate: number
    fallbackVolume: number
    fallbackHigh: number
    fallbackLow: number
    fallbackCoinVolume: number
}

function MarketRow({
    market,
    koreanName,
    rank,
    fallbackPrice,
    fallbackRate,
    fallbackVolume,
    fallbackHigh,
    fallbackLow,
    fallbackCoinVolume,
}: MarketRowProps) {
    const live = useMarketStore((s) => s.liveMap[market])
    const navigate = useNavigate()

    const tradePrice = live?.trade_price ?? fallbackPrice
    const changeRate = live?.signed_change_rate ?? fallbackRate
    const volume = live?.acc_trade_price_24h ?? fallbackVolume
    const high = live?.high_price ?? fallbackHigh
    const low = live?.low_price ?? fallbackLow
    const coinVolume = live?.acc_trade_volume_24h ?? fallbackCoinVolume

    // 현재가가 바뀌면 등락률 셀 전체 배경을 깜빡임
    const rateCellRef = useFlash<HTMLSpanElement>(tradePrice, getDirection(changeRate))

    return (
        <div className={styles.row} role="row" onClick={() => navigate(`/coins/${market}`)}>
            <span role="cell">
                <WatchButton market={market} />
            </span>
            <span role="cell">{rank}</span>
            <span className={styles.coin} role="cell">
                <Link to={`/coins/${market}`} className={styles.coinLink}>
                    <CoinLogo symbol={toSymbol(market)} />
                    {koreanName}
                    <span className={styles.coinSymbol}>{toSymbol(market)}</span>
                </Link>
            </span>
            <span role="cell">
                <Price value={tradePrice} />
            </span>
            <span role="cell" ref={rateCellRef} className={styles.rateCell}>
                <ChangeRate rate={changeRate} />
            </span>
            <span role="cell">{formatPrice(high)}</span>
            <span role="cell">{formatPrice(low)}</span>
            <span role="cell" className={styles.rangeCell}>
                <DayRangeBar low={low} high={high} current={tradePrice} />
            </span>
            <span role="cell">{formatTradePrice(volume)}</span>
            <span role="cell">{formatCoinVolume(coinVolume)}</span>
        </div>
    )
}

export default memo(MarketRow)
