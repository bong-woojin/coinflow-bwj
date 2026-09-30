type Props = {
    className?: string
}

export default function SearchIcon({ className }: Props) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
}
