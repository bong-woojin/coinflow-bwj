import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound() {
    return (
        <div className={styles.notFound}>
            <p className={styles.code}>404</p>
            <p className={styles.message}>페이지를 찾을 수 없어요</p>
            <Link to="/" className={styles.homeLink}>
                홈으로 돌아가기
            </Link>
        </div>
    )
}
