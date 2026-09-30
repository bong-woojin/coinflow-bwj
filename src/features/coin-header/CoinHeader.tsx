import type { UpbitSocketTicker, UpbitTicker } from '../../shared/types'
import {
    formatChangeSummary,
    formatCoinVolume,
    formatPrice,
    getDirection,
    toSymbol,
} from '../../shared/lib/format'
import { calcStrength } from '../../shared/lib/metrics'
import { useTradeRank } from './useTradeRank'
import CoinLogo from '../../shared/ui/CoinLogo'
import WatchButton from '../../shared/ui/WatchButton'
import RangeRow from './RangeRow'
import styles from './CoinHeader.module.css'
import dir from '../../shared/styles/direction.module.css'

type CoinHeaderProps = {
    market: string
    koreanName: string
    snapshot: UpbitTicker
    live?: UpbitSocketTicker
}

export default function CoinHeader({ market, koreanName, snapshot, live }: CoinHeaderProps) {
    const tradeRank = useTradeRank(market)
    const symbol = toSymbol(market)

    const tradePrice = live?.trade_price ?? snapshot.trade_price
    const changeRate = live?.signed_change_rate ?? snapshot.signed_change_rate
    const changePrice = live?.signed_change_price ?? snapshot.signed_change_price
    const bidVolume = live?.acc_bid_volume
    const askVolume = live?.acc_ask_volume
    const strength = calcStrength(bidVolume, askVolume)

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <div className={styles.coinNameRow}>
                    <CoinLogo symbol={symbol} size={20} />
                    <h1 className={styles.coinName}>
                        {koreanName}
                        <span className={styles.symbol}>{symbol}</span>
                    </h1>
                </div>
                <p className={styles.priceRow}>
                    <span className={styles.price}>{formatPrice(tradePrice)}원</span>
                    <span className={styles.dot}>·</span>
                    <span className={styles.changeLabel}>어제보다</span>
                    <span className={`${styles.change} ${dir[getDirection(changeRate)]}`}>
                        {formatChangeSummary(changePrice, changeRate)}
                    </span>
                    {live && (
                        <>
                            <span className={styles.dot}>·</span>
                            <span className={styles.liveBadge}>실시간</span>
                        </>
                    )}
                </p>
            </div>

            <div className={styles.headerRight}>
                <dl className={styles.statCol}>
                    <RangeRow
                        label="1일 범위"
                        low={live?.low_price ?? snapshot.low_price}
                        high={live?.high_price ?? snapshot.high_price}
                        current={tradePrice}
                    />
                    <RangeRow
                        label="52주 범위"
                        low={live?.lowest_52_week_price ?? snapshot.lowest_52_week_price}
                        high={live?.highest_52_week_price ?? snapshot.highest_52_week_price}
                        current={tradePrice}
                    />
                </dl>

                <dl className={styles.statCol}>
                    <dt>거래대금</dt>
                    <dd>{tradeRank ? `${tradeRank}위` : '-'}</dd>
                    <dt>체결강도</dt>
                    <dd>{strength !== null ? `${strength.toFixed(1)}%` : '-'}</dd>
                </dl>

                <dl className={styles.statCol}>
                    <dt>매수 체결량(오늘)</dt>
                    <dd>
                        {bidVolume !== undefined ? `${formatCoinVolume(bidVolume)} ${symbol}` : '-'}
                    </dd>
                    <dt>매도 체결량(오늘)</dt>
                    <dd>
                        {askVolume !== undefined ? `${formatCoinVolume(askVolume)} ${symbol}` : '-'}
                    </dd>
                </dl>

                <WatchButton market={market} className={styles.watchBox} />
            </div>
        </header>
    )
}
