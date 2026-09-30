import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useMarketStore } from '../../shared/store/market'
import { useUi } from '../../shared/store/ui'
import { formatSnapshotTime, toSymbol } from '../../shared/lib/format'
import CoinLogo from '../../shared/ui/CoinLogo'
import ChangeRate from '../../shared/ui/ChangeRate'
import SearchIcon from './SearchIcon'
import styles from './SearchModal.module.css'

const SECTION_SIZE = 5
const RESULT_LIMIT = 20

type Item = {
    market: string
    koreanName: string
    symbol: string
    changeRate: number
    tradeAmount: number
}

type Section = {
    title: string
    items: Item[]
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
const LISTBOX_ID = 'search-listbox'

// getState는 구독하지 않음 — 호출한 시점의 값으로 고정
function snapshotItems(): Item[] {
    const { tickers, liveMap } = useMarketStore.getState()
    return tickers.map((t) => {
        const live = liveMap[t.market]
        return {
            market: t.market,
            koreanName: t.koreanName,
            symbol: toSymbol(t.market),
            changeRate: live?.signed_change_rate ?? t.changeRate,
            tradeAmount: live?.acc_trade_price_24h ?? t.accTradePrice24h,
        }
    })
}

export default function SearchModal() {
    const navigate = useNavigate()
    const closeSearch = useUi((s) => s.closeSearch)
    const snapshotAt = useMarketStore((s) => s.snapshotAt)

    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const prevFocusRef = useRef<HTMLElement | null>(null)
    const restoreFocusRef = useRef(true)

    // 한 번만 스냅샷 — 200ms마다 재정렬돼 클릭하려던 항목이 바뀌는 것 방지
    // 시세 로딩 전에 열렸다면 tickers가 0 → n 이 되는 시점에 한 번 다시 뜸
    const hasTickers = useMarketStore((s) => s.tickers.length > 0)
    const [items, setItems] = useState<Item[]>(snapshotItems)
    if (hasTickers && items.length === 0) setItems(snapshotItems())

    const keyword = query.trim().toLowerCase()

    const sections = useMemo<Section[]>(() => {
        if (keyword) {
            const matched = items.filter(
                (it) =>
                    it.koreanName.toLowerCase().includes(keyword) ||
                    it.symbol.toLowerCase().includes(keyword),
            )
            return [{ title: '검색 결과', items: matched.slice(0, RESULT_LIMIT) }]
        }
        const popular = [...items]
            .sort((a, b) => b.tradeAmount - a.tradeAmount)
            .slice(0, SECTION_SIZE)
        const rising = [...items].sort((a, b) => b.changeRate - a.changeRate).slice(0, SECTION_SIZE)
        return [
            { title: '인기 코인', items: popular },
            { title: '급상승 코인', items: rising },
        ]
    }, [items, keyword])

    // ↑↓ 탐색은 섹션 구분 없이 한 줄로 이어진 목록 기준
    const flat = useMemo(() => sections.flatMap((s) => s.items), [sections])

    // 포커스 복원: 마운트 시 현재 포커스 저장, 언마운트 시 복원
    useEffect(() => {
        const active = document.activeElement
        prevFocusRef.current = active instanceof HTMLElement ? active : null
        inputRef.current?.focus()
        return () => {
            if (restoreFocusRef.current) prevFocusRef.current?.focus()
        }
    }, [])

    // body 스크롤 잠금
    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [])

    // 선택 항목이 스크롤 영역 밖이면 따라가기
    useEffect(() => {
        const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
        el?.scrollIntoView({ block: 'nearest' })
    }, [activeIndex])

    const go = (item: Item | undefined) => {
        if (!item) return
        // 다른 페이지로 이동하므로 헤더 검색 버튼으로 포커스를 되돌리지 않음
        restoreFocusRef.current = false
        closeSearch()
        navigate(`/coins/${item.market}`)
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        // 포커스 트랩: Tab 키 순환
        if (e.key === 'Tab') {
            const modal = modalRef.current
            if (!modal) return
            const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
                (el) => el.tabIndex >= 0,
            )
            if (focusable.length === 0) return
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
            return
        }

        if (e.nativeEvent.isComposing) return // 한글 조합 중 Enter/방향키 무시

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                if (flat.length) setActiveIndex((i) => (i + 1) % flat.length)
                break
            case 'ArrowUp':
                e.preventDefault()
                if (flat.length) setActiveIndex((i) => (i - 1 + flat.length) % flat.length)
                break
            case 'Enter':
                e.preventDefault()
                go(flat[activeIndex])
                break
            case 'Escape':
                e.preventDefault()
                if (query) {
                    setQuery('')
                    setActiveIndex(0)
                } else {
                    closeSearch()
                }
                break
        }
    }

    const activeOptId = flat.length > 0 ? `search-opt-${activeIndex}` : undefined

    let offset = 0

    return createPortal(
        <div className={styles.backdrop} onMouseDown={closeSearch}>
            <div
                ref={modalRef}
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label="코인 검색"
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={onKeyDown}
            >
                <div className={styles.inputWrap}>
                    <SearchIcon className={styles.inputIcon} />
                    <input
                        ref={inputRef}
                        className={styles.input}
                        type="text"
                        placeholder="검색어를 입력해주세요"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setActiveIndex(0)
                        }}
                        role="combobox"
                        aria-label="코인명 또는 심볼"
                        aria-expanded={flat.length > 0}
                        aria-controls={LISTBOX_ID}
                        aria-autocomplete="list"
                        aria-activedescendant={activeOptId}
                        aria-haspopup="listbox"
                    />
                </div>

                <div
                    ref={listRef}
                    id={LISTBOX_ID}
                    className={styles.body}
                    role={flat.length > 0 ? 'listbox' : undefined}
                    aria-label={flat.length > 0 ? '코인 목록' : undefined}
                >
                    {sections.map((section, sectionIndex) => {
                        const start = offset
                        offset += section.items.length
                        const hasItems = section.items.length > 0
                        const titleId = `search-group-${sectionIndex}`
                        return (
                            <section
                                key={section.title}
                                className={styles.section}
                                role={hasItems ? 'group' : undefined}
                                aria-labelledby={hasItems ? titleId : undefined}
                            >
                                <header className={styles.sectionHead} aria-hidden={hasItems}>
                                    <h3 id={titleId} className={styles.sectionTitle}>
                                        {section.title}
                                        {keyword && (
                                            <span className={styles.count}>
                                                {section.items.length}
                                            </span>
                                        )}
                                    </h3>
                                    {!keyword && snapshotAt && (
                                        <span className={styles.asOf}>
                                            {formatSnapshotTime(snapshotAt)}
                                        </span>
                                    )}
                                </header>

                                {!hasItems ? (
                                    <p className={styles.empty}>검색 결과가 없어요</p>
                                ) : (
                                    <ul role="presentation">
                                        {section.items.map((item, i) => {
                                            const index = start + i
                                            return (
                                                <li key={item.market} role="presentation">
                                                    <button
                                                        type="button"
                                                        id={`search-opt-${index}`}
                                                        role="option"
                                                        tabIndex={-1}
                                                        aria-selected={index === activeIndex}
                                                        data-index={index}
                                                        className={styles.row}
                                                        data-active={index === activeIndex}
                                                        onMouseMove={() => setActiveIndex(index)}
                                                        onClick={() => go(item)}
                                                    >
                                                        {!keyword && (
                                                            <span className={styles.rank}>
                                                                {i + 1}
                                                            </span>
                                                        )}
                                                        <CoinLogo symbol={item.symbol} size={28} />
                                                        <span className={styles.name}>
                                                            {item.koreanName}
                                                        </span>
                                                        <span className={styles.symbol}>
                                                            {item.symbol}
                                                        </span>
                                                        <span className={styles.rate}>
                                                            <ChangeRate rate={item.changeRate} />
                                                        </span>
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </section>
                        )
                    })}
                </div>

                <footer className={styles.footer}>
                    <span className={styles.hint}>
                        <kbd className={styles.key}>↵</kbd>종목으로 이동하기
                    </span>
                    <span className={styles.hint}>
                        <kbd className={styles.key}>ESC</kbd>지우기
                    </span>
                    <span className={styles.hint}>
                        <kbd className={styles.key}>↑</kbd>
                        <kbd className={styles.key}>↓</kbd>탐색하기
                    </span>
                </footer>
            </div>
        </div>,
        document.body,
    )
}
