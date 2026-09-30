import { formatChangeRate, getDirection } from '../lib/format'
import dir from '../styles/direction.module.css'

type ChangeRateProps = {
    rate: number
}

export default function ChangeRate({ rate }: ChangeRateProps) {
    return (
        <span className={dir[getDirection(rate)]}>
      {formatChangeRate(rate)}
    </span>
    )
}
