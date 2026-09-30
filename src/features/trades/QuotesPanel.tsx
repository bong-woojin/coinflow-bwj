import { useState } from 'react'
import type { Trade } from '../../shared/types'
import Segmented from '../../shared/ui/Segmented'
import TradeList from './TradeList'
import DailyList from './DailyList'
import styles from './QuotesPanel.module.css'

type Mode = 'live' | 'daily'

const MODES: { label: string; value: Mode }[] = [
    { label: '실시간', value: 'live' },
    { label: '일별', value: 'daily' },
]

type QuotesPanelProps = {
    market: string
    trades: Trade[]
    prevClose: number
}

// 시세 패널 — 실시간 체결 / 일별 시세 전환. 일별은 처음 열 때만 요청
export default function QuotesPanel({ market, trades, prevClose }: QuotesPanelProps) {
    const [mode, setMode] = useState<Mode>('live')

    return (
        <>
            <div className={styles.toolbar}>
                <Segmented
                    id="quotes"
                    options={MODES}
                    value={mode}
                    onChange={setMode}
                    ariaLabel="시세 보기 방식"
                />
            </div>
            <div id={`quotes-panel-${mode}`} role="tabpanel" aria-labelledby={`quotes-${mode}`}>
                {mode === 'live'
                    ? <TradeList trades={trades} prevClose={prevClose} />
                    : <DailyList market={market} />}
            </div>
        </>
    )
}
