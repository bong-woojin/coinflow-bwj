import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMarketStore } from '../../shared/store/market'
import { useSparklines } from './useSparklines'
import Sparkline from '../../shared/ui/Sparkline'
import MarketBreadth from './MarketBreadth'
import MarketStats from './MarketStats'
import {
    formatPrice,
    formatChangeRate,
    formatChangeDiff,
    getDirection,
    toSymbol,
} from '../../shared/lib/format'
import type { Ticker } from '../../shared/types'
import styles from './MarketSummary.module.css'

const HERO = 'KRW-BTC'
const SUB = ['KRW-ETH', 'KRW-XRP', 'KRW-SOL', 'KRW-DOGE']
const ALL = [HERO, ...SUB]
const EMPTY_SERIES: number[] = [] // 매 렌더 새 [] 가 memo(Sparkline)을 깨지 않도록 고정

type CoinProps = {
    base: Ticker
    series: number[]
}

// 스냅샷 + 이 코인의 실시간 값. 자기 코인만 구독해서 다른 코인 틱에는 리렌더되지 않음
function useQuote(base: Ticker) {
    const live = useMarketStore((s) => s.liveMap[base.market])
    const price = live?.trade_price ?? base.tradePrice
    const rate = live?.signed_change_rate ?? base.changeRate
    const changePrice = live?.signed_change_price ?? base.changePrice
    return { price, rate, changePrice, direction: getDirection(rate) }
}

const HeroCard = memo(function HeroCard({ base, series }: CoinProps) {
    const { price, rate, changePrice, direction } = useQuote(base)

    return (
        <Link to={`/coins/${base.market}`} className={styles.hero}>
            <p className={styles.heroName}>
                {base.koreanName}
                <span className={styles.symbolBadge}>{toSymbol(base.market)}</span>
            </p>

            <p className={styles.heroPrice}>{formatPrice(price)}</p>

            <p className={styles.heroRate} data-direction={direction}>
                {formatChangeDiff(changePrice)}
                <span className={styles.heroRatePct}>{formatChangeRate(rate)}</span>
            </p>

            <div className={styles.heroChart}>
                <Sparkline values={series} direction={direction} baseline={base.prevClosingPrice} />
            </div>
        </Link>
    )
})

const SubRow = memo(function SubRow({ base, series }: CoinProps) {
    const { price, rate, changePrice, direction } = useQuote(base)

    return (
        <Link to={`/coins/${base.market}`} className={styles.subRow}>
            <div className={styles.subChart}>
                <Sparkline values={series} direction={direction} baseline={base.prevClosingPrice} />
            </div>

            <div className={styles.subInfo}>
                <p className={styles.subName}>
                    {base.koreanName}
                    <span className={styles.symbolBadge}>{toSymbol(base.market)}</span>
                </p>
                <p className={styles.subPrice}>{formatPrice(price)}</p>
                <p className={styles.subDiff} data-direction={direction}>
                    {formatChangeDiff(changePrice)}
                    <span className={styles.subRate}>{formatChangeRate(rate)}</span>
                </p>
            </div>
        </Link>
    )
})

export default function MarketSummary() {
    const tickers = useMarketStore((s) => s.tickers)
    const series = useSparklines(ALL)

    const snapshotMap = useMemo(() => new Map(tickers.map((t) => [t.market, t])), [tickers])

    const hero = snapshotMap.get(HERO)

    return (
        <div className={styles.summary}>
            <p className={styles.groupLabel}>시총 Top 5</p>

            {hero ? (
                <HeroCard base={hero} series={series[HERO] ?? EMPTY_SERIES} />
            ) : (
                <div className={styles.hero} />
            )}

            <section className={styles.subs}>
                {SUB.map((market) => {
                    const base = snapshotMap.get(market)
                    return base ? (
                        <SubRow key={market} base={base} series={series[market] ?? EMPTY_SERIES} />
                    ) : null
                })}
            </section>

            <section className={styles.side}>
                <MarketBreadth />
                <MarketStats />
            </section>
        </div>
    )
}
