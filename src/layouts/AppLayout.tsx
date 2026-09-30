import { Outlet } from 'react-router-dom'
import styles from './AppLayout.module.css'
import WatchlistSidebar from '../features/sidebar/WatchlistSidebar'
import RecentSidebar from '../features/sidebar/RecentSidebar'
import TickerBar from '../features/ticker-bar/TickerBar'
import { useMarketFeed } from '../shared/api/useMarketFeed'
import { useScrollFade } from '../shared/hooks/useScrollFade'
import Gnb from './Gnb'
import RailNav from './RailNav'
import { useUi } from '../shared/store/ui'

export default function AppLayout() {
    const sidebarTab = useUi((s) => s.sidebarTab)
    const asideOpen = useUi((s) => s.asideOpen)

    const mainRef = useScrollFade<HTMLElement>()
    const asideRef = useScrollFade<HTMLElement>()

    useMarketFeed()

    return (
        <div className={styles.shell} data-aside={asideOpen ? 'open' : 'closed'}>
            <header className={styles.gnb}>
                <Gnb />
            </header>

            <main ref={mainRef} className={styles.main}>
                <Outlet />
            </main>

            <aside
                ref={asideRef}
                className={styles.aside}
                id="aside-panel"
                aria-hidden={!asideOpen}
            >
                {sidebarTab === 'watchlist' ? <WatchlistSidebar /> : <RecentSidebar />}
            </aside>

            <nav className={styles.rail}>
                <RailNav />
            </nav>

            <footer className={styles.ticker}>
                <TickerBar />
            </footer>
        </div>
    )
}