import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './shared/styles/reset.css'
import './shared/styles/tokens.css'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('index.html에 #root 요소가 없습니다')

createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
