import { useEffect } from 'react'
import { useUi } from '../../shared/store/ui'
import SearchIcon from './SearchIcon'
import SearchModal from './SearchModal'
import styles from './SearchButton.module.css'

function isTypingTarget(el: EventTarget | null) {
    if (!(el instanceof HTMLElement)) return false
    return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

export default function SearchButton() {
    const searchOpen = useUi((s) => s.searchOpen)
    const openSearch = useUi((s) => s.openSearch)

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
            if (isTypingTarget(e.target)) return
            e.preventDefault()
            openSearch()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [openSearch])

    return (
        <>
            <button
                type="button"
                className={styles.button}
                onClick={openSearch}
                aria-haspopup="dialog"
                aria-expanded={searchOpen}
            >
                <SearchIcon className={styles.icon} />
                <kbd className={styles.key}>/</kbd>
                <span className={styles.label}>를 눌러 검색하세요</span>
            </button>

            {searchOpen && <SearchModal />}
        </>
    )
}
