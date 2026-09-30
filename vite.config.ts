import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        // 배포 환경의 /upbit 프록시(api/upbit.ts)와 같은 경로를 로컬에서도 사용
        proxy: {
            '/upbit': {
                target: 'https://api.upbit.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/upbit/, '/v1'),
            },
        },
    },
})
