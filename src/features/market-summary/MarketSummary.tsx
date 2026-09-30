import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMarketStore } from '../../shared/store/market'
import { useSparklines } from './useSparklines'
import Sparkline from '../../shared/ui/Sparkline'
import MarketBreadth from './MarketBreadth'
import MarketStats from './MarketStats'
import { formatPrice, formatChangeRate, formatChangeDiff, getDirection, toSymbol } from '../../shared/lib/format'
import styles from './MarketSummary.module.css'

const HERO = 'KRW-BTC'
const SUB = ['KRW-ETH', 'KRW-XRP', 'KRW-SOL', 'KRW-DOGE']
const ALL = [HERO, ...SUB]

export default function MarketSummary() {
    const tickers = useMarketStore((s) => s.tickers)
    const liveMap = useMarketStore((s) => s.liveMap)
    const series = useSparklines(ALL)

    const snapshotMap = useMemo(
        () => new Map(tickers.map((t) => [t.market, t])),
        [tickers]
    )

    function read(market: string) {
        const base = snapshotMap.get(market)
        if (!base) return null

        const live = liveMap[market]
        const price = live?.trade_price ?? base.tradePrice
        const rate = live?.signed_change_rate ?? base.changeRate

        return { base, price, rate, direction: getDirection(rate) }
    }

    const hero = read(HERO)

    return (
        <div className={styles.summary}>
            <p className={styles.groupLabel}>시총 Top 5</p>

            <Link to={`/coins/${HERO}`} className={styles.hero}>
                {hero && (
                    <>
                        <p className={styles.heroName}>
                            {hero.base.koreanName}
                            <span className={styles.symbolBadge}>{toSymbol(HERO)}</span>
                        </p>

                        <p className={styles.heroPrice}>
                            {formatPrice(hero.price)}
                        </p>

                        <p className={styles.heroRate} data-direction={hero.direction}>
                            {formatChangeDiff(hero.price, hero.rate)}
                            <span className={styles.heroRatePct}>{formatChangeRate(hero.rate)}</span>
                        </p>

                        <div className={styles.heroChart}>
                            <Sparkline
                                values={series[HERO] ?? []}
                                direction={hero.direction}
                                baseline={hero.price / (1 + hero.rate)}
                            />
                        </div>
                    </>
                )}
            </Link>

            <section className={styles.subs}>
                {SUB.map((market) => {
                    const d = read(market)
                    if (!d) return null

                    return (
                        <Link key={market} to={`/coins/${market}`} className={styles.subRow}>
                            <div className={styles.subChart}>
                                <Sparkline
                                    values={series[market] ?? []}
                                    direction={d.direction}
                                    baseline={d.price / (1 + d.rate)}
                                />
                            </div>

                            <div className={styles.subInfo}>
                                <p className={styles.subName}>
                                    {d.base.koreanName}
                                    <span className={styles.symbolBadge}>{toSymbol(market)}</span>
                                </p>
                                <p className={styles.subPrice}>
                                    {formatPrice(d.price)}
                                </p>
                                <p className={styles.subDiff} data-direction={d.direction}>
                                    {formatChangeDiff(d.price, d.rate)}
                                    <span className={styles.subRate}>{formatChangeRate(d.rate)}</span>
                                </p>
                            </div>
                        </Link>
                    )
                })}
            </section>

            <section className={styles.side}>
                <MarketBreadth />
                <MarketStats />
            </section>
        </div>
    )
}