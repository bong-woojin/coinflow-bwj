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

export default function SearchModal() {
    const navigate = useNavigate()
    const closeSearch = useUi((s) => s.closeSearch)
    const tickers = useMarketStore((s) => s.tickers)
    const liveMap = useMarketStore((s) => s.liveMap)
    const snapshotAt = useMarketStore((s) => s.snapshotAt)

    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    // 스냅샷 + 실시간 값을 합친 검색용 목록
    const items = useMemo<Item[]>(
        () =>
            tickers.map((t) => {
                const live = liveMap[t.market]
                return {
                    market: t.market,
                    koreanName: t.koreanName,
                    symbol: toSymbol(t.market),
                    changeRate: live?.signed_change_rate ?? t.changeRate,
                    tradeAmount: live?.acc_trade_price_24h ?? t.accTradePrice24h,
                }
            }),
        [tickers, liveMap]
    )

    const keyword = query.trim().toLowerCase()

    const sections = useMemo<Section[]>(() => {
        if (keyword) {
            const matched = items.filter(
                (it) =>
                    it.koreanName.toLowerCase().includes(keyword) ||
                    it.symbol.toLowerCase().includes(keyword)
            )
            return [{ title: '검색 결과', items: matched.slice(0, RESULT_LIMIT) }]
        }
        const popular = [...items]
            .sort((a, b) => b.tradeAmount - a.tradeAmount)
            .slice(0, SECTION_SIZE)
        const rising = [...items]
            .sort((a, b) => b.changeRate - a.changeRate)
            .slice(0, SECTION_SIZE)
        return [
            { title: '인기 코인', items: popular },
            { title: '급상승 코인', items: rising },
        ]
    }, [items, keyword])

    // ↑↓ 탐색은 섹션 구분 없이 한 줄로 이어진 목록 기준
    const flat = useMemo(() => sections.flatMap((s) => s.items), [sections])

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // 선택 항목이 스크롤 영역 밖이면 따라가기
    useEffect(() => {
        const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
        el?.scrollIntoView({ block: 'nearest' })
    }, [activeIndex])

    const go = (item: Item | undefined) => {
        if (!item) return
        closeSearch()
        navigate(`/coins/${item.market}`)
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing) return   // 한글 조합 중 Enter/방향키 무시

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

    let offset = 0

    return createPortal(
        <div className={styles.backdrop} onMouseDown={closeSearch}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label="코인 검색"
                onMouseDown={(e) => e.stopPropagation()}
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
                        onKeyDown={onKeyDown}
                        aria-label="코인명 또는 심볼"
                    />
                </div>

                <div ref={listRef} className={styles.body}>
                    {sections.map((section) => {
                        const start = offset
                        offset += section.items.length
                        return (
                            <section key={section.title} className={styles.section}>
                                <header className={styles.sectionHead}>
                                    <h3 className={styles.sectionTitle}>
                                        {section.title}
                                        {keyword && (
                                            <span className={styles.count}>{section.items.length}</span>
                                        )}
                                    </h3>
                                    {!keyword && snapshotAt && (
                                        <span className={styles.asOf}>{formatSnapshotTime(snapshotAt)}</span>
                                    )}
                                </header>

                                {section.items.length === 0 ? (
                                    <p className={styles.empty}>검색 결과가 없어요</p>
                                ) : (
                                    <ul>
                                        {section.items.map((item, i) => {
                                            const index = start + i
                                            return (
                                                <li key={item.market}>
                                                    <button
                                                        type="button"
                                                        data-index={index}
                                                        className={styles.row}
                                                        data-active={index === activeIndex}
                                                        onMouseMove={() => setActiveIndex(index)}
                                                        onClick={() => go(item)}
                                                    >
                                                        {!keyword && <span className={styles.rank}>{i + 1}</span>}
                                                        <CoinLogo symbol={item.symbol} size={28} />
                                                        <span className={styles.name}>{item.koreanName}</span>
                                                        <span className={styles.symbol}>{item.symbol}</span>
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
        document.body
    )
}
