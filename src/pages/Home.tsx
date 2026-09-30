import styles from './Home.module.css'
import MarketSummary from '../features/market-summary/MarketSummary'
import MarketTable from '../features/market-list/MarketTable'
import { useMarketStore } from '../shared/store/market'
import { useScrollFade } from '../shared/hooks/useScrollFade'

export default function Home() {
    const tickers = useMarketStore((s) => s.tickers)
    const isLoading = useMarketStore((s) => s.isLoading)
    const error = useMarketStore((s) => s.error)
    const snapshotAt = useMarketStore((s) => s.snapshotAt)
    const scrollRef = useScrollFade<HTMLDivElement>()

    if (isLoading) return <div>불러오는 중…</div>
    if (error) return <div>{error}</div>

    return (
        <div ref={scrollRef} className={styles.panel}>
            <MarketSummary />
            <MarketTable tickers={tickers} snapshotAt={snapshotAt} />
        </div>
    )
}
