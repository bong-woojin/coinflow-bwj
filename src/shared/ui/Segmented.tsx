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
}

export default function Segmented<T extends string>({
    options,
    value,
    onChange,
    tone = 'default',
    ariaLabel,
}: SegmentedProps<T>) {
    return (
        <div className={styles.group} role="radiogroup" aria-label={ariaLabel}>
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={o.value === value}
                    className={styles.item}
                    data-tone={tone}
                    onClick={() => onChange(o.value)}
                >
                    {o.label}
                </button>
            ))}
        </div>
    )
}
