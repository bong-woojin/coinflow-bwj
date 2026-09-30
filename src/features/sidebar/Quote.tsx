import { formatPrice, getDirection, formatChangeSummary } from '../../shared/lib/format'
import styles from './Sidebar.module.css'
import dir from '../../shared/styles/direction.module.css'

type QuoteProps = {
    price: number
    changePrice: number
    changeRate: number
}

export default function Quote({ price, changePrice, changeRate }: QuoteProps) {
    const direction = getDirection(changeRate)

    return (
        <span className={styles.quote}>
            <span className={styles.quotePrice}>{formatPrice(price)}원</span>
            <span className={`${styles.quoteChange} ${dir[direction]}`}>
                {formatChangeSummary(changePrice, changeRate)}
            </span>
        </span>
    )
}
