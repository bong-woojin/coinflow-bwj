import { useEffect } from 'react'

// 페이지를 벗어나면 이전 타이틀(index.html의 COINFLOW)로 복원
export function useDocumentTitle(title: string) {
    useEffect(() => {
        const prev = document.title
        document.title = title
        return () => {
            document.title = prev
        }
    }, [title])
}
