import { useCallback } from 'react'

// ref 콜백 — 요소가 나중에 렌더돼도(조건부 렌더) DOM에 붙는 순간 연결됨
// data-scrolling: 스크롤 중인지 / data-scrolled: 맨 위가 아닌 위치인지
export function useScrollFade<T extends HTMLElement>() {
    return useCallback((el: T | null) => {
        if (!el) return

        let timer = 0

        const onScroll = () => {
            el.dataset.scrolling = 'true'
            el.dataset.scrolled = String(el.scrollTop > 0)
            clearTimeout(timer)
            timer = window.setTimeout(() => {
                el.dataset.scrolling = 'false'
            }, 800)
        }

        el.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            el.removeEventListener('scroll', onScroll)
            clearTimeout(timer)
        }
    }, [])
}
