import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useUpbitTicker } from '../shared/api/useUpbitTicker'
import { toSymbol } from '../shared/lib/format'
import type { UpbitMarket, UpbitTicker } from '../shared/types'
import styles from './CoinDetail.module.css'
import { useUpbitTrades } from '../shared/api/useUpbitTrades'
import CoinHeader from '../features/coin-header/CoinHeader'
import ChartPanel from '../features/chart/ChartPanel'
import QuotesPanel from '../features/trades/QuotesPanel'
import TradeFlowPanel from '../features/trades/TradeFlowPanel'
import CoinInfoPanel from '../features/coin-info/CoinInfoPanel'
import ReturnsPanel from '../features/returns/ReturnsPanel'
import Panel from '../shared/ui/Panel'
import { useRecent } from '../shared/store/recent'
import { useDocumentTitle } from '../shared/hooks/useDocumentTitle'
import { fetchUpbit, upbitApi } from '../shared/api/upbitApi'

export default function CoinDetail() {
    const { market } = useParams<{ market: string }>()
    const [koreanName, setKoreanName] = useState('')
    const [englishName, setEnglishName] = useState('')
    const [snapshot, setSnapshot] = useState<UpbitTicker | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { liveMap } = useUpbitTicker(market ? [market] : [])
    const trades = useUpbitTrades(market)
    const visit = useRecent((s) => s.visit)

    useDocumentTitle(market ? `COINFLOW - ${toSymbol(market)}` : 'COINFLOW')

    useEffect(() => {
        if (market) visit(market)
    }, [market, visit])

    useEffect(() => {
        if (!market) return
        async function load(code: string) {
            try {
                setIsLoading(true)
                setError(null)
                const [marketRes, tickerRes] = await Promise.all([
                    fetchUpbit(upbitApi.marketAll()),
                    fetchUpbit(upbitApi.ticker(code)),
                ])
                if (!marketRes.ok || !tickerRes.ok) throw new Error('시세를 불러오지 못했습니다')
                const markets: UpbitMarket[] = await marketRes.json()
                const tickers: UpbitTicker[] = await tickerRes.json()
                const found = markets.find((m) => m.market === code)
                setKoreanName(found?.korean_name ?? code)
                setEnglishName(found?.english_name ?? '')
                setSnapshot(tickers[0] ?? null)
            } catch (e) {
                setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다')
            } finally {
                setIsLoading(false)
            }
        }
        load(market)
    }, [market])

    if (isLoading) return <div className={styles.loading}>불러오는 중…</div>
    if (error) return <div className={styles.loading}>{error}</div>
    if (!snapshot || !market) return <div className={styles.loading}>코인을 찾을 수 없습니다</div>

    const live = liveMap[market]
    const tradePrice = live?.trade_price ?? snapshot.trade_price

    return (
        <div className={styles.detail}>
            <CoinHeader market={market} koreanName={koreanName} snapshot={snapshot} live={live} />

            <div className={styles.body}>
                <Panel title="차트" className={styles.chartArea}>
                    <ChartPanel market={market} />
                </Panel>

                <Panel title="기간별 수익률" className={styles.returnsArea}>
                    <ReturnsPanel key={market} market={market} currentPrice={tradePrice} />
                </Panel>

                <Panel title="시세" className={styles.quotesArea}>
                    <QuotesPanel key={market} market={market} trades={trades} prevClose={snapshot.prev_closing_price} />
                </Panel>

                <Panel title="매수·매도 비중" className={styles.flowArea}>
                    <TradeFlowPanel
                        symbol={toSymbol(market)}
                        bidVolume={live?.acc_bid_volume}
                        askVolume={live?.acc_ask_volume}
                        trades={trades}
                    />
                </Panel>

                <Panel title="종목정보" className={styles.infoArea}>
                    <CoinInfoPanel
                        market={market}
                        koreanName={koreanName}
                        englishName={englishName}
                        openingPrice={snapshot.opening_price}
                        prevClosePrice={snapshot.prev_closing_price}
                        tradeAmount24h={live?.acc_trade_price_24h ?? snapshot.acc_trade_price_24h}
                        tradeVolume24h={live?.acc_trade_volume_24h ?? snapshot.acc_trade_volume_24h}
                        high52={live?.highest_52_week_price ?? snapshot.highest_52_week_price}
                        high52Date={snapshot.highest_52_week_date}
                        low52={live?.lowest_52_week_price ?? snapshot.lowest_52_week_price}
                        low52Date={snapshot.lowest_52_week_date}
                    />
                </Panel>
            </div>
        </div>
    )
}
