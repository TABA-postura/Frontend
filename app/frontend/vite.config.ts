import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
// 프로덕션에서는 CloudFront 프록시를 사용하므로
// VITE_API_BASE_URL을 요구하지 않음
// 모든 API 호출은 '/api/...' 상대 경로로 처리됨
export default defineConfig({
  plugins: [react()],
  root: '.',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    // 개발 모드에서 CSP 제거 (임시)
    // headers: {
    //   'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* https://localhost:*; object-src 'none'; base-uri 'self';"
    // }
  },
})

