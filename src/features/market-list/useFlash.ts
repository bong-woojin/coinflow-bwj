import { useEffect, useRef } from 'react'
import type { Direction } from '../../shared/lib/format'
import styles from './flash.module.css'

export function useFlash<T extends HTMLElement>(value: number, direction: Direction) {
    const ref = useRef<T>(null)
    const prevValue = useRef(value)

    useEffect(() => {
        if (prevValue.current === value) return
        prevValue.current = value

        const el = ref.current
        if (!el) return

        const cls =
            direction === 'down' ? styles.flashDown : direction === 'up' ? styles.flashUp : null
        if (!cls) return

        el.classList.remove(styles.flashUp, styles.flashDown)
        void el.offsetWidth
        el.classList.add(cls)

        const timer = setTimeout(() => el.classList.remove(cls), 900)
        return () => clearTimeout(timer)
    }, [value, direction])

    return ref
}
