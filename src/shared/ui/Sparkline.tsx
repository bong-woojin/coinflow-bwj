import { memo, useId } from 'react'
import type { Direction } from '../lib/format'
import styles from './Sparkline.module.css'

type Props = {
    values: number[]
    direction: Direction
    baseline?: number
}

const W = 100
const H = 48

function smoothPath(pts: { x: number; y: number }[]) {
    let d = `M ${pts[0].x},${pts[0].y}`

    for (let i = 1; i < pts.length - 1; i++) {
        const midX = (pts[i].x + pts[i + 1].x) / 2
        const midY = (pts[i].y + pts[i + 1].y) / 2
        d += ` Q ${pts[i].x},${pts[i].y} ${midX},${midY}`
    }

    const last = pts[pts.length - 1]
    return `${d} L ${last.x},${last.y}`
}

function Sparkline({ values, direction, baseline }: Props) {
    const gradientId = useId()

    if (values.length < 2) return <div className={styles.empty} />

    const pool = baseline === undefined ? values : [...values, baseline]
    const min = Math.min(...pool)
    const max = Math.max(...pool)
    const span = max - min || 1
    const step = W / (values.length - 1)

    const toY = (v: number) => H - ((v - min) / span) * H
    const pts = values.map((v, i) => ({ x: i * step, y: toY(v) }))

    const line = smoothPath(pts)
    const area = `${line} L ${W},${H} L 0,${H} Z`

    return (
        <svg
            className={styles.chart}
            data-direction={direction}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
            </defs>

            {baseline !== undefined && (
                <line
                    x1="0"
                    y1={toY(baseline)}
                    x2={W}
                    y2={toY(baseline)}
                    stroke="currentColor"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    vectorEffect="non-scaling-stroke"
                />
            )}

            <path d={area} fill={`url(#${gradientId})`} />

            <path
                d={line}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )
}

export default memo(Sparkline)
