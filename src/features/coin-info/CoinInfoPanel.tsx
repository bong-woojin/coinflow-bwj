import { formatCoinVolume, formatPrice, formatTradePrice, toSymbol, formatShortDate } from '../../shared/lib/format'
import styles from './CoinInfoPanel.module.css'

type CoinInfoPanelProps = {
    market: string
    koreanName: string
    englishName: string
    openingPrice: number
    prevClosePrice: number
    tradeAmount24h: number
    tradeVolume24h: number
    high52: number
    high52Date: string
    low52: number
    low52Date: string
}

// 토스 '커뮤니티' 자리 — 헤더에서 뺀 기본 지표를 모아 보여줌
export default function CoinInfoPanel(props: CoinInfoPanelProps) {
    const symbol = toSymbol(props.market)

    const rows: { label: string; value: string; sub?: string }[] = [
        { label: '이름', value: props.koreanName, sub: props.englishName },
        { label: '마켓', value: props.market },
        { label: '시가', value: `${formatPrice(props.openingPrice)}원` },
        { label: '전일 종가', value: `${formatPrice(props.prevClosePrice)}원` },
        { label: '거래대금 (24h)', value: formatTradePrice(props.tradeAmount24h) },
        { label: '거래량 (24h)', value: `${formatCoinVolume(props.tradeVolume24h)} ${symbol}` },
        { label: '52주 최고', value: `${formatPrice(props.high52)}원`, sub: formatShortDate(props.high52Date) },
        { label: '52주 최저', value: `${formatPrice(props.low52)}원`, sub: formatShortDate(props.low52Date) },
    ]

    return (
        <dl className={styles.info}>
            {rows.map((r) => (
                <div key={r.label} className={styles.row}>
                    <dt>{r.label}</dt>
                    <dd>
                        {r.value}
                        {r.sub && <span className={styles.sub}>{r.sub}</span>}
                    </dd>
                </div>
            ))}
        </dl>
    )
}
