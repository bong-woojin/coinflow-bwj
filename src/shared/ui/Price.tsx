import { formatPrice } from '../lib/format'
import styles from './Price.module.css'

type PriceProps = {
    value: number
    size?: 'sm' | 'lg'
}

export default function Price({ value, size = 'sm' }: PriceProps) {
    return (
        <span className={`${styles.price} ${styles[size]}`}>
      {formatPrice(value)}
    </span>
    )
}
