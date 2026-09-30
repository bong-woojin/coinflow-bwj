import { useState } from 'react'
import styles from './CoinLogo.module.css'

type Props = {
    symbol: string
    size?: number
}

export default function CoinLogo({ symbol, size = 24 }: Props) {
    const [failed, setFailed] = useState(false)
    const style = { width: size, height: size }

    if (failed) {
        return (
            <span className={styles.fallback} style={style} aria-hidden="true">
                {symbol.slice(0, 1)}
            </span>
        )
    }

    return (
        <img
            className={styles.image}
            style={style}
            src={`https://static.upbit.com/logos/${symbol}.png`}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
        />
    )
}
