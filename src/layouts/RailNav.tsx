import styles from './RailNav.module.css'
import ThemeToggle from '../shared/ui/ThemeToggle'
import { useUi } from '../shared/store/ui'

export default function RailNav() {
    const sidebarTab = useUi((s) => s.sidebarTab)
    const setSidebarTab = useUi((s) => s.setSidebarTab)
    const asideOpen = useUi((s) => s.asideOpen)
    const toggleAside = useUi((s) => s.toggleAside)

    return (
        <div className={styles.rail}>
            <button
                type="button"
                className={styles.collapse}
                onClick={toggleAside}
                aria-label={asideOpen ? '패널 닫기' : '패널 열기'}
                aria-expanded={asideOpen}
                aria-controls="aside-panel"
            >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <g fill="currentColor">
                        <path d="m3.288 20.877c-.305 0-.61-.102-.813-.305-.508-.508-.508-1.219 0-1.727l6.806-6.806-6.907-6.806c-.508-.508-.508-1.219 0-1.727s1.219-.508 1.727 0l7.618 7.618c.508.508.508 1.219 0 1.727l-7.618 7.618c-.204.304-.508.406-.813.406z" />
                        <path d="m13.395 20.877c-.305 0-.61-.102-.813-.305-.508-.508-.508-1.219 0-1.727l6.806-6.806-6.907-6.806c-.508-.508-.508-1.219 0-1.727s1.219-.508 1.727 0l7.618 7.618c.508.508.508 1.219 0 1.727l-7.618 7.618c-.204.304-.508.406-.813.406z" />
                    </g>
                </svg>
            </button>

            <button
                type="button"
                className={styles.tab}
                onClick={() => setSidebarTab('watchlist')}
                aria-pressed={asideOpen && sidebarTab === 'watchlist'}
            >
                <span className={styles.icon}>♥</span>
                관심
            </button>

            <button
                type="button"
                className={styles.tab}
                onClick={() => setSidebarTab('recent')}
                aria-pressed={asideOpen && sidebarTab === 'recent'}
            >
                <span className={styles.icon}>◷</span>
                최근 본
            </button>

            <div className={styles.bottom}>
                <ThemeToggle />
            </div>
        </div>
    )
}