import { useMemo } from 'react'
import type { Trade } from '../../shared/types'
import { formatCoinVolume, formatKrwAmount, formatTime, calcStrength } from '../../shared/lib/format'
import styles from './TradeFlowPanel.module.css'
import dir from '../../shared/styles/direction.module.css'

const BIG_TOP = 5

type TradeFlowPanelProps = {
    symbol: string
    bidVolume?: number
    askVolume?: number
    trades: Trade[]
}

type RatioBarProps = {
    title: string
    bid: number
    ask: number
    unit: string
}

// 매수(빨강) ← → 매도(파랑) 비율 막대
function RatioBar({ title, bid, ask, unit }: RatioBarProps) {
    const total = bid + ask
    const bidPct = total > 0 ? (bid / total) * 100 : 50

    return (
        <div className={styles.block}>
            <p className={styles.blockTitle}>{title}</p>
            <div className={styles.ratioLabels}>
                <span className={dir.up}>매수 {bidPct.toFixed(1)}%</span>
                <span className={dir.down}>{(100 - bidPct).toFixed(1)}% 매도</span>
            </div>
            <div className={styles.bar} aria-hidden="true">
                <span className={styles.barBid} style={{ width: `${bidPct}%` }} />
                <span className={styles.barAsk} />
            </div>
            <div className={styles.ratioValues}>
                <span>{formatCoinVolume(bid)} {unit}</span>
                <span>{formatCoinVolume(ask)} {unit}</span>
            </div>
        </div>
    )
}

export default function TradeFlowPanel({ symbol, bidVolume, askVolume, trades }: TradeFlowPanelProps) {
    const recent = useMemo(() => {
        let bid = 0
        let ask = 0
        for (const t of trades) {
            if (t.askBid === 'BID') bid += t.volume
            else ask += t.volume
        }
        return { bid, ask }
    }, [trades])

    const bigTrades = useMemo(
        () => [...trades]
            .sort((a, b) => b.price * b.volume - a.price * a.volume)
            .slice(0, BIG_TOP),
        [trades]
    )

    const strength = calcStrength(bidVolume, askVolume)

    return (
        <div className={styles.flow}>
            <div className={styles.strength}>
                <span className={styles.strengthLabel}>체결강도</span>
                <span className={styles.strengthValue} data-direction={strength === null ? 'even' : strength >= 100 ? 'up' : 'down'}>
                    {strength !== null ? `${strength.toFixed(1)}%` : '-'}
                </span>
            </div>

            {bidVolume !== undefined && askVolume !== undefined && (
                <RatioBar title="오늘 누적 (09:00~)" bid={bidVolume} ask={askVolume} unit={symbol} />
            )}
            <RatioBar title={`최근 ${trades.length}건`} bid={recent.bid} ask={recent.ask} unit={symbol} />

            <div className={styles.block}>
                <p className={styles.blockTitle}>큰 체결 TOP {BIG_TOP} <span className={styles.hint}>최근 {trades.length}건 중</span></p>
                {bigTrades.length === 0 ? (
                    <p className={styles.empty}>체결 내역을 기다리는 중…</p>
                ) : (
                    <ul className={styles.bigList}>
                        {bigTrades.map((t) => (
                            <li key={t.id} className={styles.bigRow}>
                                <span className={t.askBid === 'BID' ? styles.tagBid : styles.tagAsk}>
                                    {t.askBid === 'BID' ? '매수' : '매도'}
                                </span>
                                <span className={styles.bigAmount}>{formatKrwAmount(t.price * t.volume)}</span>
                                <span className={styles.bigTime}>{formatTime(t.timestamp)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
