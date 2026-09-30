import { useWatchlist } from '../store/watchlist'
import styles from './WatchButton.module.css'

type WatchButtonProps = {
    market: string
    className?: string
}

export default function WatchButton({ market, className }: WatchButtonProps) {
    const isOn = useWatchlist((s) => s.markets.includes(market))
    const toggle = useWatchlist((s) => s.toggle)

    return (
        <button
            type="button"
            className={className ? `${styles.button} ${className}` : styles.button}
            aria-pressed={isOn}
            aria-label={isOn ? '관심목록에서 제거' : '관심목록에 추가'}
            onClick={(e) => {
                e.stopPropagation()
                toggle(market)
            }}
        >
            {isOn ? '♥' : '♡'}
        </button>
    )
}
