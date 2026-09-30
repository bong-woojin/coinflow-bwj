import type { ReactNode } from 'react'
import styles from './Panel.module.css'

type PanelProps = {
    title: string
    className?: string
    actions?: ReactNode
    children: ReactNode
}

export default function Panel({ title, className, actions, children }: PanelProps) {
    return (
        <section className={className ? `${styles.panel} ${className}` : styles.panel}>
            <header className={styles.head}>
                <h2 className={styles.title}>{title}</h2>
                {actions && <div className={styles.actions}>{actions}</div>}
            </header>
            <div className={styles.content}>{children}</div>
        </section>
    )
}
