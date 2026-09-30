import { Link, NavLink } from 'react-router-dom'
import SearchButton from '../features/search/SearchButton'
import styles from './Gnb.module.css'

export default function Gnb() {
    return (
        <div className={styles.gnb}>
            <Link to="/" className={styles.logo}>
                COINFLOW
            </Link>

            <nav className={styles.nav}>
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                    }
                >
                    홈
                </NavLink>
            </nav>

            <div className={styles.searchBox}>
                <SearchButton />
            </div>
        </div>
    )
}
