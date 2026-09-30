import { useRef } from 'react'
import styles from './Segmented.module.css'

type Option<T extends string> = {
    label: string
    value: T
}

type SegmentedProps<T extends string> = {
    options: Option<T>[]
    value: T
    onChange: (value: T) => void
    tone?: 'default' | 'up' | 'down'
    ariaLabel: string
    id?: string
}

export default function Segmented<T extends string>({
    options,
    value,
    onChange,
    tone = 'default',
    ariaLabel,
    id,
}: SegmentedProps<T>) {
    const groupRef = useRef<HTMLDivElement>(null)

    const handleKeyDown = (e: React.KeyboardEvent, currentValue: T) => {
        if (
            e.key !== 'ArrowRight' &&
            e.key !== 'ArrowLeft' &&
            e.key !== 'ArrowDown' &&
            e.key !== 'ArrowUp'
        )
            return
        e.preventDefault()
        const idx = options.findIndex((o) => o.value === currentValue)
        const next =
            e.key === 'ArrowRight' || e.key === 'ArrowDown'
                ? (idx + 1) % options.length
                : (idx - 1 + options.length) % options.length
        onChange(options[next].value)
        groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
    }

    return (
        <div ref={groupRef} className={styles.group} role="tablist" aria-label={ariaLabel}>
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    role="tab"
                    id={id ? `${id}-${o.value}` : undefined}
                    aria-selected={o.value === value}
                    aria-controls={id ? `${id}-panel-${o.value}` : undefined}
                    className={styles.item}
                    data-tone={tone}
                    tabIndex={o.value === value ? 0 : -1}
                    onClick={() => onChange(o.value)}
                    onKeyDown={(e) => handleKeyDown(e, o.value)}
                >
                    {o.label}
                </button>
            ))}
        </div>
    )
}
