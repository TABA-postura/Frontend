import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
// 프로덕션에서는 CloudFront 프록시를 사용하므로
// VITE_API_BASE_URL을 요구하지 않음
// 모든 API 호출은 '/api/...' 상대 경로로 처리됨
export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL || 'https://api.taba-postura.com';

  return {
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
      // 개발 환경에서 이미지 요청을 백엔드로 프록시 (CORS 문제 해결)
      // /images/content/ 경로만 백엔드로 프록시 (백엔드에서 제공하는 이미지)
      // 나머지 /images/ 경로는 로컬 public 폴더에서 서빙
      proxy: {
        '/images/content': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
})

