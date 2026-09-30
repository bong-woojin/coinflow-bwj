import { useEffect, useRef, useState } from 'react'
import { createChart, CandlestickSeries, HistogramSeries, ColorType } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import styles from './CandleChart.module.css'
import { fetchUpbit, upbitApi } from '../../shared/api/upbitApi'

export type Timeframe = '1m' | '15m' | '1h' | '1d' | '1w' | '1mo' | '1y'

type CandleChartProps = {
    market: string
    timeframe?: Timeframe
}

type UpbitCandle = {
    candle_date_time_kst: string
    opening_price: number
    high_price: number
    low_price: number
    trade_price: number
    candle_acc_trade_volume: number
}

function candleUrl(market: string, timeframe: Timeframe) {
    switch (timeframe) {
        case '1m':  return upbitApi.candles('minutes/1', market, 200)
        case '15m': return upbitApi.candles('minutes/15', market, 200)
        case '1h':  return upbitApi.candles('minutes/60', market, 200)
        case '1d':  return upbitApi.candles('days', market, 200)
        case '1w':  return upbitApi.candles('weeks', market, 200)
        case '1mo': return upbitApi.candles('months', market, 60)
        case '1y':  return upbitApi.candles('days', market, 365)
    }
}

function cssVar(name: string) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export default function CandleChart({ market, timeframe = '1m' }: CandleChartProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
    const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null)
    const [failed, setFailed] = useState(false)
    const [retryKey, setRetryKey] = useState(0)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const chart = createChart(el, {
            autoSize: true,
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: cssVar('--text-secondary'),
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: cssVar('--fill-subtle') },
                horzLines: { color: cssVar('--fill-subtle') },
            },
            rightPriceScale: { borderVisible: false },
            timeScale: {
                borderVisible: false,
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            crosshair: { mode: 0 },
        })

        const series = chart.addSeries(CandlestickSeries, {
            upColor: cssVar('--up'),
            downColor: cssVar('--down'),
            borderUpColor: cssVar('--up'),
            borderDownColor: cssVar('--down'),
            wickUpColor: cssVar('--up'),
            wickDownColor: cssVar('--down'),
            priceFormat: {
                type: 'custom',
                formatter: (price: number) => Math.round(price).toLocaleString('ko-KR'),
                minMove: 1,
            },
        })

        const volume = chart.addSeries(HistogramSeries, {
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
        })

        chart.priceScale('volume').applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
        })

        chartRef.current = chart
        seriesRef.current = series
        volumeRef.current = volume

        return () => {
            chart.remove()
            chartRef.current = null
            seriesRef.current = null
            volumeRef.current = null
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        async function load() {
            let raw: UpbitCandle[]
            try {
                const res = await fetchUpbit(candleUrl(market, timeframe))
                if (!res.ok) throw new Error(String(res.status))
                raw = await res.json()
            } catch {
                if (cancelled) return
                // 이전 코인/기간 차트가 남아 보이지 않도록 비움
                seriesRef.current?.setData([])
                volumeRef.current?.setData([])
                setFailed(true)
                return
            }
            if (cancelled) return
            setFailed(false)

            const isIntraday = timeframe === '1m' || timeframe === '15m' || timeframe === '1h'
            // 업비트 시각 문자열엔 오프셋이 없어 그대로 파싱하면 로컬 시간이 됨 → KST 시각에 'Z'를 붙여
            // UTC로 표시하는 차트에 KST 벽시계 시각이 그대로 찍히게 함 (일봉을 utc로 파싱하면 하루 밀림)
            const toTime = (c: UpbitCandle) => (new Date(c.candle_date_time_kst + 'Z').getTime() / 1000) as UTCTimestamp

            const candles = raw.map((c) => ({
                time: toTime(c),
                open: c.opening_price,
                high: c.high_price,
                low: c.low_price,
                close: c.trade_price,
            })).reverse()

            const volumes = raw.map((c) => ({
                time: toTime(c),
                value: c.candle_acc_trade_volume,
                color: c.trade_price >= c.opening_price
                    ? cssVar('--up') + '99'
                    : cssVar('--down') + '99',
            })).reverse()

            chartRef.current?.applyOptions({ timeScale: { timeVisible: isIntraday } })
            seriesRef.current?.setData(candles)
            volumeRef.current?.setData(volumes)
            chartRef.current?.timeScale().fitContent()
        }

        load()
        return () => { cancelled = true }
    }, [market, timeframe, retryKey])

    return (
        <div className={styles.wrap}>
            <div ref={containerRef} className={styles.chart} />
            {failed && (
                <div className={styles.error}>
                    <p>차트를 불러오지 못했어요</p>
                    <button type="button" className={styles.retry} onClick={() => setRetryKey((k) => k + 1)}>
                        다시 시도
                    </button>
                </div>
            )}
        </div>
    )
}
