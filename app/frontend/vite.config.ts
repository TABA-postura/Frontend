import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 환경 변수 로드 (mode에 따라 .env.production 또는 .env.development 자동 로드)
  const env = loadEnv(mode, process.cwd(), '');
  
  // 프로덕션 빌드 시 환경 변수 검증
  if (mode === 'production') {
    const apiBaseUrl = env.VITE_API_BASE_URL;
    
    if (!apiBaseUrl) {
      console.error('❌ ERROR: VITE_API_BASE_URL 환경 변수가 설정되지 않았습니다!');
      console.error('프로덕션 빌드를 위해 .env.production 파일에 VITE_API_BASE_URL을 설정하세요.');
      console.error('');
      console.error('해결 방법:');
      console.error('1. 프로젝트 루트에 .env.production 파일 생성');
      console.error('2. 다음 내용 추가:');
      console.error('   VITE_API_BASE_URL=https://d28g9sy3jh6o3a.cloudfront.net');
      console.error('3. npm run build 재실행');
      process.exit(1);
    }
    
    if (apiBaseUrl.startsWith('http://')) {
      console.warn('⚠️ WARNING: 프로덕션 환경에서 HTTP URL을 사용하고 있습니다!');
      console.warn(`현재 설정: ${apiBaseUrl}`);
      console.warn('⚠️ Mixed Content 경고가 발생할 수 있습니다.');
      console.warn('💡 HTTPS 사용을 권장하지만, 백엔드가 HTTPS를 지원하지 않는 경우 이대로 진행합니다.');
      // 에러를 던지지 않고 경고만 표시하고 계속 진행
    }
    
    console.log('✅ 환경 변수 확인 완료:');
    console.log(`   VITE_API_BASE_URL: ${apiBaseUrl}`);
  }
  
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
    },
  };
})

